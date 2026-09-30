"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/Button";
import HoverSwapImage from "@/components/product/HoverSwapImage";
import { getRecommended, Product } from "@/db/actions";
import { useRouter } from "next/navigation";

export default function Recommended({ products: initialProducts }: { products?: Product[] }) {
  const router = useRouter();
  const defaultImage =
    "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048484/timect/right-main.png";
  const [mainImage, setMainImage] = useState(defaultImage);
  const [layerA, setLayerA] = useState(defaultImage);
  const [layerB, setLayerB] = useState(defaultImage);
  const [showB, setShowB] = useState(false);
  const showBRef = useRef(false);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
    } else {
      getRecommended().then(setProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    const active = showBRef.current ? layerB : layerA;
    if (mainImage === active) return;
    if (showBRef.current) {
      setLayerA(mainImage);
      showBRef.current = false;
      setShowB(false);
    } else {
      setLayerB(mainImage);
      showBRef.current = true;
      setShowB(true);
    }
  }, [mainImage, layerA, layerB]);

  return (
    <section className="grid md:grid-cols-2 gap-0 mb-16">
      <div
        className="watch-wrap relative"
        style={{
          background: "linear-gradient(160deg,#04121c,#0c2c42 60%,#123a56)",
          minHeight: "480px",
          maxHeight: "90vh",
          aspectRatio: "auto",
        }}
      >
        <img
          src={layerA}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover product-hover-crossfade ${
            showB ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={layerB}
          alt="Featured Watch"
          className={`absolute inset-0 w-full h-full object-cover product-hover-crossfade ${
            showB ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <div className="px-4 md:px-8 py-6 md:py-12">
        <h2 className="text-center tracked-sm text-[15px] mb-8">
          RECOMMENDED FOR YOU
        </h2>
        <div
          className="grid grid-cols-3 gap-6"
          onMouseLeave={() => setMainImage(defaultImage)}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="text-center cursor-pointer min-w-0 group"
              onMouseEnter={() => setMainImage(product.image || "")}
              onClick={() => router.push(`/product/${product.slug}`)}
            >
              <div className="watch-wrap relative overflow-hidden">
                <HoverSwapImage
                  src={product.image}
                  hoverSrc={product.hoverImage}
                  alt={product.name || ""}
                  priority
                />
              </div>
              <div
                className="mt-2 prod-name truncate"
                title={product.name || ""}
              >
                {product.name || ""}
              </div>
              <div className="prod-code">{product.code || ""}</div>
              <div className="price">{product.price}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12 border-t border-gray-200 pt-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
            <Button
              type="button"
              bgColor="#fff"
              textColor="#000"
              borderColor="#222"
              hoverBgColor="#000000"
              hoverTextColor="#ffffff"
              className="text-[12px] tracking-widest px-10 py-3 font-medium cursor-pointer relative z-20"
              onClick={() => router.push("/watches")}
            >
              VIEW ALL WATCHES
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
