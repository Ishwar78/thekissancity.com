import React from "react";
import {
  ShieldCheck,
  Leaf,
  RefreshCw,
  Phone,
} from "lucide-react";

const features = [
  {
    icon: <ShieldCheck size={22} />,
    title: "100% Authentic",
    desc: "Certified organic products",
  },
  {
    icon: <Leaf size={22} />,
    title: "Farm Direct",
    desc: "Zero middlemen pricing",
  },
  {
    icon: <RefreshCw size={22} />,
    title: "Easy Returns",
    desc: "7-day hassle-free returns",
  },
  {
    icon: <Phone size={22} />,
    title: "24/7 Support",
    desc: "Expert kissan support",
  },
];

export default function FeaturesStrip() {
  return (
    <section className="features-strip">
      <div className="features-strip__container">
        <div className="features-strip__grid">
          {features.map((feature, index) => (
            <React.Fragment key={feature.title}>
              <div className="feature-item">
                <div className="feature-item__icon">
                  {feature.icon}
                </div>

                <div className="feature-item__text">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>

              {index < features.length - 1 && (
                <div className="features-strip__divider" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}