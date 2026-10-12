import type { LayoutConfig, TabConfig } from '../types/api';

// What GET /config returns. Typed as LayoutConfig only for authoring; the app still validates it as unknown.

const tabs: TabConfig[] = [
  { id: 'home', label: 'Home', icon: 'home', screen: 'home' },
  { id: 'bookings', label: 'Bookings', icon: 'calendar', screen: 'bookings' },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: 'pill',
    screen: 'prescriptions',
  },
  { id: 'profile', label: 'Profile', icon: 'user', screen: 'profile' },
];

const categories = [
  { id: 'consult', label: 'Consult', icon: 'stethoscope' },
  { id: 'lab', label: 'Lab tests', icon: 'lab' },
  { id: 'pharmacy', label: 'Pharmacy', icon: 'pill' },
  { id: 'vaccines', label: 'Vaccines', icon: 'vaccine' },
  { id: 'heart', label: 'Heart care', icon: 'heart' },
];

const quickActions = [
  { id: 'book', label: 'Book', icon: 'calendar', target: 'book' },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: 'prescription',
    target: 'prescriptions',
  },
  { id: 'reminders', label: 'Reminders', icon: 'bell', target: 'reminders' },
  { id: 'family', label: 'Family', icon: 'family', target: 'family' },
];

const doctorCards = [
  {
    id: 'doc_1',
    name: 'Dr. Lakshmi Reddy',
    specialty: 'General Physician',
    photoUrl: 'https://i.pravatar.cc/240?img=47',
    nextAvailable: 'Today, 5:30 PM',
  },
  {
    id: 'doc_2',
    name: 'Dr. Arjun Rao',
    specialty: 'Cardiologist',
    photoUrl: 'https://i.pravatar.cc/240?img=12',
    nextAvailable: 'Tomorrow, 10:00 AM',
  },
  {
    id: 'doc_3',
    name: 'Dr. Fatima Sheikh',
    specialty: 'Paediatrician',
    photoUrl: 'https://i.pravatar.cc/240?img=32',
    nextAvailable: 'Today, 7:00 PM',
  },
  {
    id: 'doc_4',
    name: 'Dr. Suresh Naidu',
    specialty: 'Orthopaedic',
    photoUrl: 'https://i.pravatar.cc/240?img=60',
    nextAvailable: 'Wed, 11:30 AM',
  },
];

export const normalConfig: LayoutConfig = {
  version: 12,
  theme: {
    primary: '#0F766E',
    secondary: '#134E4A',
    background: '#F4F8F7',
    surface: '#FFFFFF',
    textPrimary: '#10231F',
    textSecondary: '#4B635E',
    accent: '#D97706',
  },
  tabs,
  sections: [
    {
      id: 'hero',
      type: 'hero_banner',
      background: { kind: 'gradient', value: '#0F766E,#134E4A' },
      items: [
        {
          greeting: 'Namaste, Ramesh garu',
          subtitle: 'How are you feeling today?',
        },
      ],
    },
    {
      id: 'categories',
      type: 'category_chips',
      background: { kind: 'color', value: '#FFFFFF' },
      items: categories,
    },
    {
      id: 'quick',
      type: 'quick_actions',
      background: { kind: 'color', value: '#E6F2F0' },
      title: 'Quick actions',
      items: quickActions,
    },
    {
      id: 'offer',
      type: 'offer_strip',
      background: { kind: 'color', value: '#FEF3C7' },
      items: [{ message: 'Free home sample pickup on lab tests above ₹499' }],
    },
    {
      id: 'doctors',
      type: 'doctor_carousel',
      background: { kind: 'color', value: '#FFFFFF' },
      title: 'Doctors at Sri Sai Clinic',
      items: doctorCards,
    },
    // Deliberately unknown: proves the renderer skips types it does not know.
    {
      id: 'future',
      type: 'video_story',
      background: { kind: 'color', value: '#FFFFFF' },
      items: [],
    },
    {
      id: 'services',
      type: 'service_grid',
      background: { kind: 'gradient', value: '#F4F8F7,#DCEDEA' },
      title: 'Popular services',
      items: [
        {
          id: 'svc_1',
          name: 'Full body checkup',
          priceInr: 1499,
          imageUrl: 'https://picsum.photos/seed/tapza-checkup/400/300',
          badge: 'Popular',
        },
        {
          id: 'svc_2',
          name: 'Thyroid profile',
          priceInr: 449,
          imageUrl: 'https://picsum.photos/seed/tapza-thyroid/400/300',
        },
        {
          id: 'svc_3',
          name: 'Diabetes screening',
          priceInr: 299,
          imageUrl: 'https://picsum.photos/seed/tapza-sugar/400/300',
          badge: '20% off',
        },
        {
          id: 'svc_4',
          name: 'Flu vaccine',
          priceInr: 899,
          imageUrl: 'https://picsum.photos/seed/tapza-flu/400/300',
        },
      ],
    },
  ],
};

export const festivalConfig: LayoutConfig = {
  version: 13,
  theme: {
    primary: '#9A3412',
    secondary: '#7C2D12',
    background: '#FFF8EE',
    surface: '#FFFFFF',
    textPrimary: '#2A1608',
    textSecondary: '#6B4A33',
    accent: '#B45309',
    festival: {
      name: 'Diwali',
      greeting: 'Happy Diwali, Ramesh garu',
      bannerImageUrl: 'https://picsum.photos/seed/tapza-diwali-lamps/900/600',
    },
  },
  tabs,
  sections: [
    {
      id: 'hero',
      type: 'hero_banner',
      background: {
        kind: 'image',
        value: 'https://picsum.photos/seed/tapza-diwali-lamps/900/600',
      },
      items: [
        {
          greeting: 'Happy Diwali, Ramesh garu',
          subtitle: 'A healthy festival for you and your family',
        },
      ],
    },
    {
      id: 'offer',
      type: 'offer_strip',
      background: { kind: 'gradient', value: '#FDE68A,#FDBA74' },
      items: [
        { message: 'Diwali offer: 25% off family health checkups till 25 Oct' },
      ],
    },
    {
      id: 'services',
      type: 'service_grid',
      background: { kind: 'color', value: '#FFEDD5' },
      title: 'Festival health packages',
      items: [
        {
          id: 'svc_5',
          name: 'Family checkup (4 members)',
          priceInr: 3999,
          imageUrl: 'https://picsum.photos/seed/tapza-family/400/300',
          badge: 'Diwali 25% off',
        },
        {
          id: 'svc_3',
          name: 'Diabetes screening',
          priceInr: 249,
          imageUrl: 'https://picsum.photos/seed/tapza-sugar/400/300',
          badge: 'Sweets season',
        },
        {
          id: 'svc_6',
          name: 'Burn and first-aid kit',
          priceInr: 349,
          imageUrl: 'https://picsum.photos/seed/tapza-kit/400/300',
        },
      ],
    },
    {
      id: 'quick',
      type: 'quick_actions',
      background: { kind: 'color', value: '#FFFFFF' },
      title: 'Quick actions',
      items: quickActions,
    },
    {
      id: 'doctors',
      type: 'doctor_carousel',
      background: { kind: 'gradient', value: '#FFF8EE,#FFEDD5' },
      title: 'Available this festival week',
      items: doctorCards.slice(0, 3),
    },
    {
      id: 'categories',
      type: 'category_chips',
      background: { kind: 'color', value: '#FFFFFF' },
      items: categories,
    },
  ],
};
