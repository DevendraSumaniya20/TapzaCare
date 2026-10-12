import type { ComponentType } from 'react';
import type { SectionConfig } from '../../types/api';
import { CategoryChips } from './sections/CategoryChips';
import { DoctorCarousel } from './sections/DoctorCarousel';
import { HeroBanner } from './sections/HeroBanner';
import { OfferStrip } from './sections/OfferStrip';
import { QuickActions } from './sections/QuickActions';
import { ServiceGrid } from './sections/ServiceGrid';

export type SectionProps = {
  section: SectionConfig;
  // Extra top padding for the first section, whose background runs up behind the floating header.
  topInset?: number;
};

// Adding a section type = one component and one line here.
const SECTIONS: Record<string, ComponentType<SectionProps>> = {
  hero_banner: HeroBanner,
  category_chips: CategoryChips,
  quick_actions: QuickActions,
  service_grid: ServiceGrid,
  doctor_carousel: DoctorCarousel,
  offer_strip: OfferStrip,
};

// Object.hasOwn guards against a config type like "constructor" resolving to an Object.prototype member.
export const isKnownSection = (section: SectionConfig) =>
  Object.hasOwn(SECTIONS, section.type);

/** Renders one config section. A type this build does not know renders nothing. */
export function SectionRenderer({ section, topInset }: SectionProps) {
  if (!isKnownSection(section)) return null;
  const Section = SECTIONS[section.type];
  return <Section section={section} topInset={topInset} />;
}
