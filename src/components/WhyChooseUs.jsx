import React from 'react';
import {
  Leaf,
  Tractor,
  ShieldCheck,
  Heart,
} from 'lucide-react';

import './WhyChooseUs.css';

const reasons = [
  {
    num: '01',
    icon: (
      <Leaf
        size={24}
        className="why-card__icon-svg"
      />
    ),
    badgeNum: '100%',
    badgeLabel: 'ORIGINAL & REAL',
    title: 'Unfiltered Purity',
    desc: "No additives, no alterations. We bring you food in its most honest form, preserving the land's natural nutrients and authentic taste.",
  },
  {
    num: '02',
    icon: (
      <Tractor
        size={24}
        className="why-card__icon-svg"
      />
    ),
    badgeNum: 'Direct',
    badgeLabel: 'IMPACT',
    title: 'Farm to Fork Direct',
    desc: 'We bridge the gap and ensure you get the freshest harvest while the farmer receives a fair, honest income.',
  },
  {
    num: '03',
    icon: (
      <ShieldCheck
        size={24}
        className="why-card__icon-svg"
      />
    ),
    badgeNum: "Nature's",
    badgeLabel: 'INTEGRITY',
    title: 'Scientifically Pure',
    desc: 'Using traditional wisdom and modern quality standards, our products are crafted to stay fresh naturally without a single drop of synthetic preservatives or chemicals.',
  },
  {
    num: '04',
    icon: (
      <Heart
        size={24}
        className="why-card__icon-svg"
      />
    ),
    badgeNum: '500+',
    badgeLabel: 'FARMERS',
    title: 'Local Farmers, Cultivating Prosperity',
    desc: 'Your purchase is an investment in our local farming families. Together, we are building a sustainable future for the people who feed our nation.',
  },
];

export default function WhyChooseUs() {
  return (
    <section
      className="why-choose-us"
      id="why-choose-us"
    >
      <div className="container">
        <div className="why-header">
          <span className="why-header__badge">
            OUR PROMISE
          </span>

          <h2 className="why-header__title">
            Why Choose <span>Us?</span>
          </h2>

          <div className="why-header__divider" />

          {/* <p className="why-header__subtitle">
            We believe food should be honest, clean,
            and kind — to you and the earth.
          </p> */}
        </div>

        <div className="why-grid">
          {reasons.map((reason, index) => (
            <div
              key={reason.num || index}
              className="why-card"
            >
              <span
                className="why-card__watermark"
                aria-hidden="true"
              >
                {reason.num}
              </span>

              <div className="why-card__icon-wrap">
                {reason.icon}
              </div>

              <div className="why-card__badge-row">
                <span className="why-card__badge-num">
                  {reason.badgeNum}
                </span>

                <span className="why-card__badge-label">
                  {reason.badgeLabel}
                </span>
              </div>

              <div className="why-card__divider" />

              <h3 className="why-card__title">
                {reason.title}
              </h3>

              <p className="why-card__desc">
                {reason.desc}
              </p>
            </div>
          ))}
        </div>

        <div
          className="why-grid__scroll-hint"
          aria-hidden="true"
        >
          Swipe to explore →
        </div>
      </div>
    </section>
  );
}
