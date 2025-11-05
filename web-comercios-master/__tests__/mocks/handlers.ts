import { http, HttpResponse } from 'msw';

export const handlers = [
  // Dashboard Analytics
  http.get('/api/analytics/dashboard', () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_customers: 150,
        active_customers: 120,
        new_customers_this_month: 25,
        total_points_issued: 5000,
        points_issued_this_month: 850,
        total_checkins: 450,
        checkins_this_month: 75,
        total_gift_cards: 30,
        gift_cards_redeemed: 15,
        avg_points_per_customer: 33.3,
        top_customers: [
          { id: '1', name: 'Juan Pérez', phone: '+584121234567', points: 125 },
          { id: '2', name: 'María García', phone: '+584129876543', points: 98 },
          { id: '3', name: 'Carlos López', phone: '+584145556789', points: 87 },
        ],
        recent_activity: [
          {
            id: '1',
            type: 'checkin',
            customer_name: 'Juan Pérez',
            points: 10,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'gift_card',
            customer_name: 'María García',
            points: 100,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      },
    });
  }),

  // Check-in (POS)
  http.post('/api/checkin', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        points_assigned: body.amount ? Math.floor(body.amount / 10) : 50,
        new_balance: 150,
        gift_card_generated: false,
      },
    });
  }),

  // Customer Search
  http.get('/api/customers/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Juan Pérez',
          phone: '+584121234567',
          email: 'juan@example.com',
          points_balance: 125,
          total_checkins: 45,
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          name: 'María García',
          phone: '+584129876543',
          email: 'maria@example.com',
          points_balance: 98,
          total_checkins: 32,
          created_at: '2024-02-20T14:30:00Z',
        },
      ].filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query)
      ),
    });
  }),

  // Get Customer by ID
  http.get('/api/customers/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: 'Juan Pérez',
        phone: '+584121234567',
        email: 'juan@example.com',
        points_balance: 125,
        total_checkins: 45,
        total_points_earned: 450,
        created_at: '2024-01-15T10:00:00Z',
        last_checkin: '2024-10-12T16:30:00Z',
        transactions: [
          {
            id: '1',
            type: 'checkin',
            points: 50,
            amount: 500,
            created_at: '2024-10-12T16:30:00Z',
          },
          {
            id: '2',
            type: 'gift_card_redemption',
            points: -100,
            created_at: '2024-10-10T10:15:00Z',
          },
        ],
      },
    });
  }),

  // Get Challenges
  http.get('/api/challenges', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Visit 5 times this week',
          description: 'Get bonus points for frequent visits',
          type: 'frequency',
          target_value: 5,
          reward_points: 50,
          is_active: true,
          created_at: '2024-10-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Spend $100 in one visit',
          description: 'Big spender bonus',
          type: 'amount',
          target_value: 100,
          reward_points: 25,
          is_active: true,
          created_at: '2024-10-01T00:00:00Z',
        },
      ],
    });
  }),

  // Create Challenge
  http.post('/api/challenges', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        id: '3',
        ...body,
        created_at: new Date().toISOString(),
      },
    });
  }),

  // Gift Cards
  http.get('/api/gift-cards', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          code: 'GIFT-2024-ABC123',
          customer_id: '1',
          customer_name: 'Juan Pérez',
          points_value: 100,
          is_redeemed: false,
          created_at: '2024-10-10T00:00:00Z',
          expires_at: '2024-12-31T23:59:59Z',
        },
        {
          id: '2',
          code: 'GIFT-2024-XYZ789',
          customer_id: '2',
          customer_name: 'María García',
          points_value: 100,
          is_redeemed: true,
          redeemed_at: '2024-10-11T15:30:00Z',
          created_at: '2024-10-08T00:00:00Z',
          expires_at: '2024-12-31T23:59:59Z',
        },
      ],
    });
  }),
];
