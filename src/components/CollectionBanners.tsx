import Link from "next/link";

const collections: {
  label: string;
  href: string;
  image: string;
  bg: string;
  className: string;
  style?: { color: string };
}[] = [
  {
    label: "GOLD TRUTON",
    href: "/watches?filter=gold-truton",
    image:
      "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048470/timect/gold_truton_chronograph.jpg",
    bg: "linear-gradient(160deg,#1a2a3a,#0a1622)",
    className: "cap serif text-[18px]",
  },
  {
    label: "BLUE",
    href: "/watches?filter=blue",
    image:
      "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048468/timect/daydate_blue.png",
    bg: "linear-gradient(160deg,#0d3a56,#04141f)",
    className: "cap text-[15px] tracked-sm",
  },
  {
    label: "LADIES",
    href: "/watches?filter=ladies",
    image:
      "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048481/timect/ladies_gold_tt.png",
    bg: "linear-gradient(160deg,#dedac8,#b7b295)",
    className: "cap text-[16px] tracked-sm",
    style: { color: "#111" },
  },
  {
    label: "ROSE GOLD",
    href: "/watches?filter=rose-gold",
    image:
      "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048487/timect/rose_gents_date.png",
    bg: "linear-gradient(160deg,#0a1a33,#020814)",
    className: "cap text-[16px] tracked-sm",
  },
  {
    label: "ROSE LADIES",
    href: "/watches?filter=rose-ladies",
    image:
      "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048491/timect/rose_ladies.png",
    bg: "linear-gradient(160deg,#0c0c0c,#000)",
    className: "cap text-[16px] tracked-sm",
  },
  {
    label: "SPECIAL EDITION",
    href: "/watches?filter=special-edition",
    image:
      "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048480/timect/image_9.png",
    bg: "linear-gradient(160deg,#2a2a2a,#111)",
    className: "cap text-[15px] tracked-sm leading-tight",
  },
];

export default function CollectionBanners() {
  return (
    <section className="max-w-[1400px] mx-auto px-8 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            className="collection-tile group cursor-pointer"
            style={{ background: item.bg }}
          >
            <img src={item.image} alt={item.label} />
            <div className="grad"></div>
            <div
              className={`${item.className} transition-transform duration-300 group-hover:translate-y-[-2px]`}
              style={item.style}
            >
              {item.label === "SPECIAL EDITION" ? (
                <>
                  SPECIAL
                  <br />
                  EDITION
                </>
              ) : (
                item.label
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
