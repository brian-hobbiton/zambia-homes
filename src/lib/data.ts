export const users = [
  {
    id: 'user-1',
    name: 'Jane Tenant',
    email: 'tenant@example.com',
    role: 'TENANT',
    avatarUrl: 'https://picsum.photos/seed/u1/100/100'
  },
  {
    id: 'user-2',
    name: 'John Landlord',
    email: 'landlord@example.com',
    role: 'LANDLORD',
    avatarUrl: 'https://picsum.photos/seed/u2/100/100'
  },
  {
    id: 'user-3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    avatarUrl: 'https://picsum.photos/seed/u3/100/100'
  },
];

export const properties = [
  {
    id: 'prop-1',
    title: 'Modern Family Home in Woodlands',
    description:
      'A beautiful and spacious 4-bedroom house located in the serene neighborhood of Woodlands, Lusaka. This home features a large garden, a modern kitchen with granite countertops, and ample parking space. The master bedroom is en-suite and comes with a walk-in closet. Enjoy the peace and quiet of this prime location while being just a short drive from shopping malls and international schools. The property is secured with an electric fence and a motorized gate. It is ideal for a family looking for comfort and security.',
    summary:
      'Spacious 4-bed Woodlands home with large garden, modern kitchen, and robust security. Ideal for families seeking comfort and convenience near schools and shops.',
    rent: 25000,
    deposit: 50000,
    location: 'Woodlands, Lusaka',
    bedrooms: 4,
    bathrooms: 3,
    parkingSpots: 2,
    amenities: ['Garden', 'Modern Kitchen', 'Electric Fence', 'Walk-in Closet', 'Pet Friendly'],
    imageId: 'prop1-img1',
    images: ['prop1-img1', 'prop1-img2', 'prop1-img3'],
    landlordId: 'user-2',
    status: 'APPROVED',
  },
  {
    id: 'prop-2',
    title: 'Cozy 2-Bedroom Apartment in Kabulonga',
    description:
      'This charming 2-bedroom apartment is located in the heart of Kabulonga. It offers a comfortable living space, a fully-equipped kitchenette, and a shared swimming pool. The complex is highly secure with 24/7 security guards and CCTV surveillance. It is perfect for a young professional or a couple. Rent includes water and garbage collection services.',
    summary:
      'Secure 2-bed Kabulonga apartment with shared pool and 24/7 security. Perfect for professionals, rent includes water and garbage services.',
    rent: 12000,
    deposit: 24000,
    location: 'Kabulonga, Lusaka',
    bedrooms: 2,
    bathrooms: 1,
    parkingSpots: 1,
    amenities: ['Swimming Pool', '24/7 Security', 'CCTV'],
    imageId: 'prop2-img1',
    images: ['prop2-img1', 'prop2-img2'],
    landlordId: 'user-2',
    status: 'APPROVED',
  },
  {
    id: 'prop-3',
    title: 'Spacious House in Roma Park',
    description:
      'A great family home in the gated community of Roma Park. This property has 3 bedrooms, a large living area, and a private backyard. The community offers a safe environment for kids to play. It is a new listing and awaiting approval.',
    summary: '',
    rent: 18000,
    deposit: 36000,
    location: 'Roma, Lusaka',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 2,
    amenities: ['Gated Community', 'Private Backyard'],
    imageId: 'prop3-img1',
    images: ['prop3-img1'],
    landlordId: 'user-2',
    status: 'PENDING',
  },
  {
    id: 'prop-4',
    title: 'Luxury Villa in Leopard\'s Hill',
    description:
      'Experience unparalleled luxury in this stunning 5-bedroom villa. Featuring a private pool, home cinema, and breathtaking views. Submitted for verification.',
    summary: '',
    rent: 60000,
    deposit: 120000,
    location: 'Leopard\'s Hill, Lusaka',
    bedrooms: 5,
    bathrooms: 5,
    parkingSpots: 3,
    amenities: ['Private Pool', 'Home Cinema', 'Gated Community'],
    imageId: 'prop4-img1',
    images: ['prop4-img1'],
    landlordId: 'user-2',
    status: 'PENDING',
  },
  {
    id: 'prop-5',
    title: 'Modern Loft in City Center',
    description:
      'Stylish loft apartment perfect for city living. Close to all amenities, with a great view of the Lusaka skyline. Fully furnished and ready to move in.',
    summary:
      'Move-in ready, fully furnished loft in Lusaka city center. Offers stunning skyline views and immediate access to all amenities.',
    rent: 15000,
    deposit: 30000,
    location: 'CBD, Lusaka',
    bedrooms: 1,
    bathrooms: 1,
    parkingSpots: 1,
    amenities: ['Fully Furnished', 'City View'],
    imageId: 'prop5-img1',
    images: ['prop5-img1'],
    landlordId: 'user-2',
    status: 'APPROVED',
  },
    {
    id: 'prop-6',
    title: 'Secure Townhouse in a Gated Estate',
    description:
      'This 3-bedroom townhouse is situated in a highly secure gated community in Ibex Hill. It comes with modern fittings, a communal gym, and a playground for children. The master bedroom is self-contained. The estate has a backup generator and water tanks to ensure uninterrupted living. It\'s an excellent choice for expatriates and families looking for a secure and comfortable lifestyle.',
    summary:
      'Secure 3-bed Ibex Hill townhouse in a gated community with a gym, playground, and backup utilities. Master is en-suite. Ideal for families and expats.',
    rent: 22000,
    deposit: 44000,
    location: 'Ibex Hill, Lusaka',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 2,
    amenities: ['Gated Community', 'Communal Gym', 'Backup Generator', 'Playground'],
    imageId: 'prop6-img1',
    images: ['prop6-img1'],
    landlordId: 'user-2',
    status: 'APPROVED',
  },
];

export const kycVerifications = [
  {
    id: 'kyc-1',
    landlordId: 'user-2',
    landlordName: 'John Landlord',
    documentType: 'National ID',
    status: 'APPROVED',
    submittedAt: new Date('2023-10-15T10:00:00Z'),
  },
  {
    id: 'kyc-2',
    landlordId: 'new-landlord-1',
    landlordName: 'Mary Properties',
    documentType: 'Passport',
    status: 'PENDING',
    submittedAt: new Date('2024-05-20T14:30:00Z'),
  },
];


export const messages = {
  'thread-1': [
    {
      id: 'msg-1',
      senderId: 'user-1',
      text: 'Hello, I am interested in the Modern Family Home in Woodlands. Is it still available?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: 'msg-2',
      senderId: 'user-2',
      text: 'Hi Jane, yes it is. Would you like to schedule a viewing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 55),
    },
    {
      id: 'msg-3',
      senderId: 'user-1',
      text: 'That would be great! How about this Saturday at 10 AM?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
     {
      id: 'msg-4',
      senderId: 'user-2',
      text: 'Saturday at 10 AM works for me. See you then!',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    }
  ],
};

export const messageThreads = [
  {
    id: 'thread-1',
    participants: ['user-1', 'user-2'],
    subject: properties.find(p => p.id === 'prop-1')?.title,
    lastMessage: 'Saturday at 10 AM works for me. See you then!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 15),
    unreadCount: 0,
    otherParticipant: users.find(u => u.id === 'user-2'),
  }
];

export type User = (typeof users)[0];
export type Property = (typeof properties)[0];
