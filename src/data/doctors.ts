import type { Doctor } from '../types/api';

export const doctors: Doctor[] = [
  {
    id: 'doc_1',
    name: 'Dr. Lakshmi Reddy',
    specialty: 'General Physician',
    photoUrl: 'https://i.pravatar.cc/240?img=47',
    feeInr: 400,
    languages: ['Telugu', 'Hindi', 'English'],
  },
  {
    id: 'doc_2',
    name: 'Dr. Arjun Rao',
    specialty: 'Cardiologist',
    photoUrl: 'https://i.pravatar.cc/240?img=12',
    feeInr: 800,
    languages: ['Telugu', 'English'],
  },
  {
    id: 'doc_3',
    name: 'Dr. Fatima Sheikh',
    specialty: 'Paediatrician',
    photoUrl: 'https://i.pravatar.cc/240?img=32',
    feeInr: 500,
    languages: ['Hindi', 'Urdu', 'English'],
  },
  {
    id: 'doc_4',
    name: 'Dr. Suresh Naidu',
    specialty: 'Orthopaedic',
    photoUrl: 'https://i.pravatar.cc/240?img=60',
    feeInr: 650,
    languages: ['Telugu', 'Hindi'],
  },
];
