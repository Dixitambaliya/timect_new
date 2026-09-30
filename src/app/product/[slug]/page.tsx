'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductAccordion from '@/components/product/ProductAccordion';
import RelatedProducts from '@/components/product/RelatedProducts';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

import { getMainProduct, getProductById, getProductBySlug, getProductSlugByImage, Product } from '@/db/actions';
import { signalPageReady } from '@/lib/page-ready';

/** Keep already-fetched variants so switching feels instant. */
const productCache = new Map<string, Product>();

function buildAccordionItems(productData: Product) {
  const specifications =
    productData.specifications && productData.specifications.length > 0
      ? productData.specifications
      : [
          {
            title: 'Description',
            type: 'text',
            content:
              productData.description ||
              productData.subtitle ||
              'No additional description available.',
          },
        ];

  return specifications.map((spec) => {
    let content: React.ReactNode;
    if (spec.type === 'details' && spec.items) {
      content = (
        <ul className="space-y-2 list-disc list-inside">
          {spec.items.map((item, idx) => {
            if (typeof item !== 'string') return null;
            const parts = item.split(': ');
            if (parts.length > 1) {
              return (
                <li key={idx}>
                  <strong>{parts[0]}:</strong> {parts.slice(1).join(': ')}
                </li>
              );
            }
            return <li key={idx}>{item}</li>;
          })}
        </ul>
      );
    } else if (spec.type === 'grid' && spec.items) {
      content = (
        <div className="grid grid-cols-2 gap-4">
          {spec.items.map((item: any, idx) => (
            <div key={idx}>
              <p className="font-semibold text-black">{item.label}</p>
              <p>{item.value}</p>
            </div>
          ))}
        </div>
      );
    } else {
      content = <p>{spec.content}</p>;
    }

    return {
      title: spec.title,
      content,
    };
  });
}

async function resolveVariants(data: Product): Promise<Product> {
  if (!data.variants || data.variants.length === 0) return data;
  const resolvedVariants = await Promise.all(
    data.variants.map(async (v) => {
      if (v.slug) return v;
      const slug = await getProductSlugByImage(v.image);
      return { ...v, slug: slug || undefined };
    }),
  );
  return { ...data, variants: resolvedVariants };
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slugStr = params?.slug as string;

  const [productData, setProductData] = useState<Product | null>(() =>
    slugStr && productCache.has(slugStr) ? productCache.get(slugStr)! : null,
  );
  /** Only block the whole page on the very first load with no cached product. */
  const [initialLoading, setInitialLoading] = useState(!productData);
  /** Soft refresh while switching variants — keep UI painted. */
  const [switching, setSwitching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const requestIdRef = useRef(0);

  const applyProduct = useCallback((data: Product | null) => {
    if (!data) {
      setNotFound(true);
      setProductData(null);
      return;
    }
    setNotFound(false);
    if (data.slug) productCache.set(data.slug, data);
    setProductData(data);
  }, []);

  useEffect(() => {
    const reqId = ++requestIdRef.current;
    let cancelled = false;

    const load = async () => {
      const cached = slugStr ? productCache.get(slugStr) : undefined;
      if (cached) {
        // Instant paint from cache; still revalidate in background lightly
        applyProduct(cached);
        setInitialLoading(false);
        setSwitching(false);
      } else if (productData) {
        // Keep current product visible while fetching the next variant
        setSwitching(true);
      } else {
        setInitialLoading(true);
      }

      try {
        let data: Product | null = null;

        if (!slugStr) {
          data = await getMainProduct();
        } else {
          const id = parseInt(slugStr, 10);
          if (!isNaN(id) && id.toString() === slugStr) {
            data = await getProductById(id);
            if (data?.slug && data.slug !== slugStr) {
              if (!cancelled && reqId === requestIdRef.current) {
                productCache.set(data.slug, await resolveVariants(data));
                router.replace(`/product/${data.slug}`);
              }
              return;
            }
          } else {
            data = await getProductBySlug(slugStr);
          }
        }

        if (cancelled || reqId !== requestIdRef.current) return;

        if (data) {
          data = await resolveVariants(data);
        }
        if (cancelled || reqId !== requestIdRef.current) return;
        applyProduct(data);

        // Prefetch sibling variants so the next click paints instantly
        if (data?.variants?.length) {
          void Promise.all(
            data.variants
              .map((v) => v.slug)
              .filter((s): s is string => !!s && s !== data.slug && !productCache.has(s))
              .map(async (s) => {
                try {
                  const sibling = await getProductBySlug(s);
                  if (sibling) {
                    const resolved = await resolveVariants(sibling);
                    productCache.set(s, resolved);
                  }
                } catch {
                  /* ignore prefetch errors */
                }
              }),
          );
        }
      } catch (err) {
        console.error('Failed to load product', err);
        if (!cancelled && reqId === requestIdRef.current && !productData) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled && reqId === requestIdRef.current) {
          setInitialLoading(false);
          setSwitching(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
    // productData intentionally omitted — we only react to slug changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugStr, router, applyProduct]);

  // Tell Timect preloader to exit only when real content is ready (no skeleton flash)
  useEffect(() => {
    if (!initialLoading && (productData || notFound)) {
      signalPageReady();
    }
  }, [initialLoading, productData, notFound]);

  // Blank white while loading — global Timect preloader covers this entirely
  if (initialLoading && !productData) {
    return (
      <div className="min-h-screen bg-white" aria-busy="true" aria-label="Loading product" />
    );
  }

  if (notFound || !productData) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-medium">Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const accordionItems = buildAccordionItems(productData);

  const currentAsVariant = {
    id: 'current',
    name: productData.title || productData.name || 'Current Variant',
    image: productData.image || productData.images?.[0] || '',
    slug: productData.slug,
  };

  const allVariants = [...(productData.variants || [])];
  const hasCurrent = allVariants.some(
    (v) => v.slug === productData.slug || v.image === productData.image,
  );
  if (!hasCurrent && productData.slug) {
    allVariants.unshift(currentAsVariant);
  }

  const selectedVariantId =
    allVariants.find(
      (v) => v.slug === productData.slug || v.image === productData.image,
    )?.id || '';

  const handleVariantSelect = (variantId: string) => {
    const variant = allVariants.find((v) => v.id === variantId);
    if (!variant?.slug || variant.slug === productData.slug) return;

    // Optimistic: if cached, paint immediately before navigation settles
    const cached = productCache.get(variant.slug);
    if (cached) {
      applyProduct(cached);
    } else {
      setSwitching(true);
    }
    router.push(`/product/${variant.slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 transition-opacity duration-200 ${
            switching ? 'opacity-90' : 'opacity-100'
          }`}
        >
          {/* Left Column - Gallery */}
          <div className="w-full lg:sticky lg:top-24 h-fit">
            <ProductGallery
              key={productData.id}
              images={
                productData.images && productData.images.length > 0
                  ? productData.images
                  : productData.image
                    ? [productData.image]
                    : []
              }
            />
          </div>

          {/* Right Column - Product Info & Details */}
          <div className="w-full max-w-xl mx-auto lg:mx-0 pt-4 lg:pt-12">
            <ProductInfo
              brand={productData.brand || productData.collection || 'Exclusive'}
              title={productData.title || productData.name || 'Product Detail'}
              subtitle={
                productData.subtitle ||
                productData.description ||
                productData.code ||
                ''
              }
              sizes={productData.sizes || []}
              price={productData.price}
              priceSubtext={
                productData.priceSubtext || 'Recommended Retail Price'
              }
              variants={allVariants}
              selectedVariantId={selectedVariantId}
              onVariantSelect={handleVariantSelect}
            />

            <ProductAccordion key={productData.id} items={accordionItems} />
          </div>
        </div>

        <RelatedProducts />
      </div>
      <Footer />
    </div>
  );
}
