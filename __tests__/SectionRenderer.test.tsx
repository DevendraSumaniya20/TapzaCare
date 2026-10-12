import { fireEvent, screen } from '@testing-library/react-native';
import { SectionRenderer } from '../src/components/home/SectionRenderer';
import type { SectionConfig } from '../src/types/api';
import {
  cleanUpStore,
  prepareStore,
  renderWithProviders,
} from '../testUtils/renderWithProviders';

const section = (
  type: string,
  items: unknown[],
  title?: string,
): SectionConfig => ({
  id: 'test',
  type,
  title,
  background: { kind: 'color', value: '#FFFFFF' },
  items,
});

const renderSection = (config: SectionConfig) =>
  renderWithProviders(<SectionRenderer section={config} />);

beforeAll(prepareStore);
afterAll(cleanUpStore);

describe('SectionRenderer', () => {
  it('renders an offer strip message', async () => {
    await renderSection(
      section('offer_strip', [{ message: 'Free pickup today' }]),
    );
    expect(screen.getByText('Free pickup today')).toBeTruthy();
  });

  it('renders nothing for an unknown section type', async () => {
    await renderSection(
      section('video_story', [{ message: 'Should not show' }]),
    );
    expect(screen.queryByText('Should not show')).toBeNull();
  });

  it('renders nothing for a prototype key used as a type', async () => {
    await renderSection(section('constructor', []));
    expect(screen.toJSON()).toBeNull();
  });

  it('shows service prices in rupees and drops malformed items', async () => {
    await renderSection(
      section('service_grid', [
        {
          id: 'a',
          name: 'Full body checkup',
          priceInr: 1499,
          imageUrl: 'https://example.com/a.png',
        },
        { id: 'b', name: 'No price' },
        'not an object',
      ]),
    );
    expect(screen.getByText('₹1,499')).toBeTruthy();
    expect(screen.queryByText('No price')).toBeNull();
  });

  it('renders the section title, and each remaining section type from its items', async () => {
    await renderSection(
      section(
        'doctor_carousel',
        [
          {
            id: 'd1',
            name: 'Dr. Lakshmi Reddy',
            specialty: 'General Physician',
            nextAvailable: 'Today, 5:30 PM',
          },
        ],
        'Our doctors',
      ),
    );
    expect(screen.getByRole('header', { name: 'Our doctors' })).toBeTruthy();
    expect(screen.getByText('Dr. Lakshmi Reddy')).toBeTruthy();
    expect(screen.getByText('Today, 5:30 PM')).toBeTruthy();
  });

  it('shows the hero greeting and subtitle', async () => {
    await renderSection(
      section('hero_banner', [
        { greeting: 'Namaste, Ramesh garu', subtitle: 'How are you today?' },
      ]),
    );
    expect(screen.getByText('Namaste, Ramesh garu')).toBeTruthy();
    expect(screen.getByText('How are you today?')).toBeTruthy();
  });

  it('renders quick actions as buttons', async () => {
    await renderSection(
      section('quick_actions', [
        { id: 'book', label: 'Book', icon: 'calendar', target: 'book' },
      ]),
    );
    expect(screen.getByRole('button', { name: 'Book' })).toBeTruthy();
  });

  it('selects a category chip when it is pressed', async () => {
    await renderSection(
      section('category_chips', [
        { id: 'consult', label: 'Consult', icon: 'stethoscope' },
        { id: 'lab', label: 'Lab tests', icon: 'lab' },
      ]),
    );
    const [consult, lab] = screen.getAllByRole('tab');
    expect(consult).toBeSelected();

    await fireEvent.press(lab);
    expect(screen.getAllByRole('tab')[1]).toBeSelected();
    expect(screen.getAllByRole('tab')[0]).not.toBeSelected();
  });

  it('renders nothing for a known section whose items are all invalid', async () => {
    await renderSection(
      section('doctor_carousel', [{ id: 'd1' }, null], 'Our doctors'),
    );
    expect(screen.queryByText('Our doctors')).toBeNull();
  });
});
