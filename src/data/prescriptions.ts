import type { Prescription } from '../types/api';

export const prescriptions: Prescription[] = [
  {
    id: 'rx_1',
    issuedAt: '2026-10-09T11:20:00+05:30',
    doctorName: 'Dr. Lakshmi Reddy',
    clinicName: 'Sri Sai Clinic, Kukatpally, Hyderabad',
    medicines: [
      {
        id: 'med_1',
        name: 'Paracetamol 650',
        dose: '1 tablet after food',
        days: 5,
        timing: ['morning', 'night'],
      },
      {
        id: 'med_2',
        name: 'Cetirizine 10',
        dose: '1 tablet',
        days: 5,
        timing: ['night'],
      },
      {
        id: 'med_3',
        name: 'ORS sachet',
        dose: '1 sachet in 1 litre water',
        days: 3,
        timing: ['morning', 'afternoon', 'night'],
      },
    ],
  },
  {
    id: 'rx_2',
    issuedAt: '2026-09-21T18:05:00+05:30',
    doctorName: 'Dr. Arjun Rao',
    clinicName: 'Sri Sai Clinic, Kukatpally, Hyderabad',
    medicines: [
      {
        id: 'med_4',
        name: 'Telmisartan 40',
        dose: '1 tablet before food',
        days: 30,
        timing: ['morning'],
      },
      {
        id: 'med_5',
        name: 'Atorvastatin 10',
        dose: '1 tablet',
        days: 30,
        timing: ['night'],
      },
    ],
  },
];
