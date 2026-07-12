-- ============================================================
-- Seed Data: analytics_daily for demo / preview purposes
-- 30 days of realistic analytics for 'demo-business-id'
-- Revenue trends upward; other metrics vary naturally.
-- ============================================================

INSERT INTO analytics_daily (
  business_id, date,
  revenue_assisted, customers_helped, appointments_booked, orders_closed,
  hours_saved, messages_answered, avg_response_time, success_rate,
  automations_completed, department_stats, top_agents
)
VALUES

-- Day 1  (30 days ago)
('demo-business-id', CURRENT_DATE - INTERVAL '29 days',
 5200, 18, 4, 6, 2.5, 24, 4.8, 86.2, 12,
 '{"support":{"tasks_today":32,"completed_today":26,"success_rate":81.3},"sales":{"tasks_today":18,"completed_today":14,"success_rate":77.8},"finance":{"tasks_today":8,"completed_today":7,"success_rate":87.5},"operations":{"tasks_today":12,"completed_today":10,"success_rate":83.3},"marketing":{"tasks_today":10,"completed_today":9,"success_rate":90.0},"hr":{"tasks_today":5,"completed_today":5,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":12,"success_rate":83.3},{"name":"Rohan Sharma","department":"sales","tasks":8,"success_rate":75.0},{"name":"Priya Nair","department":"finance","tasks":7,"success_rate":85.7}]'
),

-- Day 2
('demo-business-id', CURRENT_DATE - INTERVAL '28 days',
 5800, 22, 5, 8, 3.1, 30, 4.5, 87.5, 15,
 '{"support":{"tasks_today":35,"completed_today":30,"success_rate":85.7},"sales":{"tasks_today":20,"completed_today":16,"success_rate":80.0},"finance":{"tasks_today":9,"completed_today":8,"success_rate":88.9},"operations":{"tasks_today":14,"completed_today":12,"success_rate":85.7},"marketing":{"tasks_today":11,"completed_today":10,"success_rate":90.9},"hr":{"tasks_today":6,"completed_today":6,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":14,"success_rate":85.7},{"name":"Vikram Rao","department":"operations","tasks":9,"success_rate":88.9},{"name":"Priya Nair","department":"finance","tasks":8,"success_rate":87.5}]'
),

-- Day 3
('demo-business-id', CURRENT_DATE - INTERVAL '27 days',
 6100, 25, 6, 9, 3.8, 35, 4.2, 88.1, 18,
 '{"support":{"tasks_today":38,"completed_today":33,"success_rate":86.8},"sales":{"tasks_today":22,"completed_today":18,"success_rate":81.8},"finance":{"tasks_today":10,"completed_today":9,"success_rate":90.0},"operations":{"tasks_today":15,"completed_today":13,"success_rate":86.7},"marketing":{"tasks_today":12,"completed_today":11,"success_rate":91.7},"hr":{"tasks_today":6,"completed_today":6,"success_rate":100.0}}',
 '[{"name":"Rohan Sharma","department":"sales","tasks":11,"success_rate":81.8},{"name":"Aisha Patel","department":"support","tasks":16,"success_rate":87.5},{"name":"Priya Nair","department":"finance","tasks":9,"success_rate":88.9}]'
),

-- Day 4
('demo-business-id', CURRENT_DATE - INTERVAL '26 days',
 6500, 28, 7, 10, 4.2, 38, 3.9, 89.0, 20,
 '{"support":{"tasks_today":40,"completed_today":36,"success_rate":90.0},"sales":{"tasks_today":24,"completed_today":20,"success_rate":83.3},"finance":{"tasks_today":11,"completed_today":10,"success_rate":90.9},"operations":{"tasks_today":16,"completed_today":14,"success_rate":87.5},"marketing":{"tasks_today":13,"completed_today":12,"success_rate":92.3},"hr":{"tasks_today":7,"completed_today":7,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":18,"success_rate":88.9},{"name":"Rohan Sharma","department":"sales","tasks":13,"success_rate":84.6},{"name":"Vikram Rao","department":"operations","tasks":10,"success_rate":90.0}]'
),

-- Day 5
('demo-business-id', CURRENT_DATE - INTERVAL '25 days',
 7200, 32, 8, 12, 4.8, 42, 3.6, 90.2, 23,
 '{"support":{"tasks_today":44,"completed_today":39,"success_rate":88.6},"sales":{"tasks_today":26,"completed_today":22,"success_rate":84.6},"finance":{"tasks_today":12,"completed_today":11,"success_rate":91.7},"operations":{"tasks_today":18,"completed_today":16,"success_rate":88.9},"marketing":{"tasks_today":14,"completed_today":13,"success_rate":92.9},"hr":{"tasks_today":7,"completed_today":7,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":20,"success_rate":90.0},{"name":"Rohan Sharma","department":"sales","tasks":14,"success_rate":85.7},{"name":"Priya Nair","department":"finance","tasks":11,"success_rate":90.9}]'
),

-- Day 6
('demo-business-id', CURRENT_DATE - INTERVAL '24 days',
 7800, 35, 9, 14, 5.2, 46, 3.4, 91.0, 26,
 '{"support":{"tasks_today":46,"completed_today":42,"success_rate":91.3},"sales":{"tasks_today":28,"completed_today":24,"success_rate":85.7},"finance":{"tasks_today":13,"completed_today":12,"success_rate":92.3},"operations":{"tasks_today":19,"completed_today":17,"success_rate":89.5},"marketing":{"tasks_today":15,"completed_today":14,"success_rate":93.3},"hr":{"tasks_today":8,"completed_today":8,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":12,"success_rate":91.7},{"name":"Aisha Patel","department":"support","tasks":22,"success_rate":90.9},{"name":"Rohan Sharma","department":"sales","tasks":15,"success_rate":86.7}]'
),

-- Day 7
('demo-business-id', CURRENT_DATE - INTERVAL '23 days',
 8400, 38, 10, 15, 5.8, 50, 3.2, 91.5, 28,
 '{"support":{"tasks_today":48,"completed_today":44,"success_rate":91.7},"sales":{"tasks_today":30,"completed_today":26,"success_rate":86.7},"finance":{"tasks_today":14,"completed_today":13,"success_rate":92.9},"operations":{"tasks_today":20,"completed_today":18,"success_rate":90.0},"marketing":{"tasks_today":16,"completed_today":15,"success_rate":93.8},"hr":{"tasks_today":8,"completed_today":8,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":24,"success_rate":91.7},{"name":"Priya Nair","department":"finance","tasks":13,"success_rate":92.3},{"name":"Rohan Sharma","department":"sales","tasks":16,"success_rate":87.5}]'
),

-- Day 8
('demo-business-id', CURRENT_DATE - INTERVAL '22 days',
 8900, 40, 10, 16, 6.1, 53, 3.0, 92.0, 30,
 '{"support":{"tasks_today":50,"completed_today":46,"success_rate":92.0},"sales":{"tasks_today":31,"completed_today":27,"success_rate":87.1},"finance":{"tasks_today":14,"completed_today":13,"success_rate":92.9},"operations":{"tasks_today":21,"completed_today":19,"success_rate":90.5},"marketing":{"tasks_today":17,"completed_today":16,"success_rate":94.1},"hr":{"tasks_today":9,"completed_today":9,"success_rate":100.0}}',
 '[{"name":"Rohan Sharma","department":"sales","tasks":17,"success_rate":88.2},{"name":"Aisha Patel","department":"support","tasks":25,"success_rate":92.0},{"name":"Vikram Rao","department":"operations","tasks":14,"success_rate":92.9}]'
),

-- Day 9
('demo-business-id', CURRENT_DATE - INTERVAL '21 days',
 9500, 42, 11, 17, 6.5, 56, 2.8, 92.8, 32,
 '{"support":{"tasks_today":52,"completed_today":48,"success_rate":92.3},"sales":{"tasks_today":33,"completed_today":29,"success_rate":87.9},"finance":{"tasks_today":15,"completed_today":14,"success_rate":93.3},"operations":{"tasks_today":22,"completed_today":20,"success_rate":90.9},"marketing":{"tasks_today":17,"completed_today":16,"success_rate":94.1},"hr":{"tasks_today":9,"completed_today":9,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":26,"success_rate":92.3},{"name":"Rohan Sharma","department":"sales","tasks":18,"success_rate":88.9},{"name":"Priya Nair","department":"finance","tasks":14,"success_rate":92.9}]'
),

-- Day 10
('demo-business-id', CURRENT_DATE - INTERVAL '20 days',
 10200, 45, 12, 18, 7.0, 60, 2.7, 93.2, 34,
 '{"support":{"tasks_today":55,"completed_today":51,"success_rate":92.7},"sales":{"tasks_today":34,"completed_today":30,"success_rate":88.2},"finance":{"tasks_today":16,"completed_today":15,"success_rate":93.8},"operations":{"tasks_today":23,"completed_today":21,"success_rate":91.3},"marketing":{"tasks_today":18,"completed_today":17,"success_rate":94.4},"hr":{"tasks_today":10,"completed_today":10,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":16,"success_rate":93.8},{"name":"Aisha Patel","department":"support","tasks":28,"success_rate":92.9},{"name":"Rohan Sharma","department":"sales","tasks":19,"success_rate":89.5}]'
),

-- Day 11
('demo-business-id', CURRENT_DATE - INTERVAL '19 days',
 10800, 48, 12, 19, 7.4, 63, 2.6, 93.5, 36,
 '{"support":{"tasks_today":57,"completed_today":53,"success_rate":93.0},"sales":{"tasks_today":35,"completed_today":31,"success_rate":88.6},"finance":{"tasks_today":16,"completed_today":15,"success_rate":93.8},"operations":{"tasks_today":24,"completed_today":22,"success_rate":91.7},"marketing":{"tasks_today":19,"completed_today":18,"success_rate":94.7},"hr":{"tasks_today":10,"completed_today":10,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":29,"success_rate":93.1},{"name":"Rohan Sharma","department":"sales","tasks":20,"success_rate":90.0},{"name":"Priya Nair","department":"finance","tasks":15,"success_rate":93.3}]'
),

-- Day 12
('demo-business-id', CURRENT_DATE - INTERVAL '18 days',
 11300, 50, 13, 20, 7.8, 66, 2.5, 93.8, 38,
 '{"support":{"tasks_today":58,"completed_today":55,"success_rate":94.8},"sales":{"tasks_today":36,"completed_today":32,"success_rate":88.9},"finance":{"tasks_today":17,"completed_today":16,"success_rate":94.1},"operations":{"tasks_today":25,"completed_today":23,"success_rate":92.0},"marketing":{"tasks_today":20,"completed_today":19,"success_rate":95.0},"hr":{"tasks_today":10,"completed_today":10,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":17,"success_rate":94.1},{"name":"Aisha Patel","department":"support","tasks":30,"success_rate":93.3},{"name":"Rohan Sharma","department":"sales","tasks":21,"success_rate":90.5}]'
),

-- Day 13
('demo-business-id', CURRENT_DATE - INTERVAL '17 days',
 12000, 52, 13, 21, 8.2, 68, 2.4, 94.0, 40,
 '{"support":{"tasks_today":60,"completed_today":56,"success_rate":93.3},"sales":{"tasks_today":38,"completed_today":34,"success_rate":89.5},"finance":{"tasks_today":18,"completed_today":17,"success_rate":94.4},"operations":{"tasks_today":26,"completed_today":24,"success_rate":92.3},"marketing":{"tasks_today":20,"completed_today":19,"success_rate":95.0},"hr":{"tasks_today":11,"completed_today":11,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":31,"success_rate":93.5},{"name":"Priya Nair","department":"finance","tasks":17,"success_rate":94.1},{"name":"Rohan Sharma","department":"sales","tasks":22,"success_rate":90.9}]'
),

-- Day 14
('demo-business-id', CURRENT_DATE - INTERVAL '16 days',
 12800, 55, 14, 22, 8.6, 72, 2.3, 94.5, 42,
 '{"support":{"tasks_today":62,"completed_today":58,"success_rate":93.5},"sales":{"tasks_today":39,"completed_today":35,"success_rate":89.7},"finance":{"tasks_today":18,"completed_today":17,"success_rate":94.4},"operations":{"tasks_today":27,"completed_today":25,"success_rate":92.6},"marketing":{"tasks_today":21,"completed_today":20,"success_rate":95.2},"hr":{"tasks_today":11,"completed_today":11,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":19,"success_rate":94.7},{"name":"Aisha Patel","department":"support","tasks":32,"success_rate":93.8},{"name":"Rohan Sharma","department":"sales","tasks":23,"success_rate":91.3}]'
),

-- Day 15
('demo-business-id', CURRENT_DATE - INTERVAL '15 days',
 13500, 58, 14, 23, 9.0, 75, 2.2, 94.8, 44,
 '{"support":{"tasks_today":64,"completed_today":60,"success_rate":93.8},"sales":{"tasks_today":40,"completed_today":36,"success_rate":90.0},"finance":{"tasks_today":19,"completed_today":18,"success_rate":94.7},"operations":{"tasks_today":28,"completed_today":26,"success_rate":92.9},"marketing":{"tasks_today":22,"completed_today":21,"success_rate":95.5},"hr":{"tasks_today":11,"completed_today":11,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":33,"success_rate":93.9},{"name":"Rohan Sharma","department":"sales","tasks":24,"success_rate":91.7},{"name":"Priya Nair","department":"finance","tasks":18,"success_rate":94.4}]'
),

-- Day 16
('demo-business-id', CURRENT_DATE - INTERVAL '14 days',
 14200, 60, 15, 24, 9.4, 78, 2.1, 95.0, 46,
 '{"support":{"tasks_today":65,"completed_today":62,"success_rate":95.4},"sales":{"tasks_today":41,"completed_today":37,"success_rate":90.2},"finance":{"tasks_today":20,"completed_today":19,"success_rate":95.0},"operations":{"tasks_today":29,"completed_today":27,"success_rate":93.1},"marketing":{"tasks_today":22,"completed_today":21,"success_rate":95.5},"hr":{"tasks_today":12,"completed_today":12,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":20,"success_rate":95.0},{"name":"Aisha Patel","department":"support","tasks":34,"success_rate":94.1},{"name":"Rohan Sharma","department":"sales","tasks":25,"success_rate":92.0}]'
),

-- Day 17
('demo-business-id', CURRENT_DATE - INTERVAL '13 days',
 14800, 62, 15, 25, 9.8, 80, 2.0, 95.3, 48,
 '{"support":{"tasks_today":67,"completed_today":63,"success_rate":94.0},"sales":{"tasks_today":42,"completed_today":38,"success_rate":90.5},"finance":{"tasks_today":20,"completed_today":19,"success_rate":95.0},"operations":{"tasks_today":30,"completed_today":28,"success_rate":93.3},"marketing":{"tasks_today":23,"completed_today":22,"success_rate":95.7},"hr":{"tasks_today":12,"completed_today":12,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":35,"success_rate":94.3},{"name":"Priya Nair","department":"finance","tasks":19,"success_rate":94.7},{"name":"Rohan Sharma","department":"sales","tasks":26,"success_rate":92.3}]'
),

-- Day 18
('demo-business-id', CURRENT_DATE - INTERVAL '12 days',
 15500, 65, 16, 26, 10.2, 84, 1.9, 95.5, 50,
 '{"support":{"tasks_today":68,"completed_today":65,"success_rate":95.6},"sales":{"tasks_today":44,"completed_today":40,"success_rate":90.9},"finance":{"tasks_today":21,"completed_today":20,"success_rate":95.2},"operations":{"tasks_today":31,"completed_today":29,"success_rate":93.5},"marketing":{"tasks_today":24,"completed_today":23,"success_rate":95.8},"hr":{"tasks_today":12,"completed_today":12,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":22,"success_rate":95.5},{"name":"Aisha Patel","department":"support","tasks":36,"success_rate":94.4},{"name":"Rohan Sharma","department":"sales","tasks":27,"success_rate":92.6}]'
),

-- Day 19
('demo-business-id', CURRENT_DATE - INTERVAL '11 days',
 16100, 67, 16, 27, 10.5, 86, 1.8, 95.8, 52,
 '{"support":{"tasks_today":70,"completed_today":66,"success_rate":94.3},"sales":{"tasks_today":45,"completed_today":41,"success_rate":91.1},"finance":{"tasks_today":22,"completed_today":21,"success_rate":95.5},"operations":{"tasks_today":32,"completed_today":30,"success_rate":93.8},"marketing":{"tasks_today":24,"completed_today":23,"success_rate":95.8},"hr":{"tasks_today":13,"completed_today":13,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":37,"success_rate":94.6},{"name":"Rohan Sharma","department":"sales","tasks":28,"success_rate":92.9},{"name":"Priya Nair","department":"finance","tasks":21,"success_rate":95.2}]'
),

-- Day 20
('demo-business-id', CURRENT_DATE - INTERVAL '10 days',
 16800, 68, 17, 28, 10.8, 88, 1.8, 96.0, 54,
 '{"support":{"tasks_today":72,"completed_today":68,"success_rate":94.4},"sales":{"tasks_today":46,"completed_today":42,"success_rate":91.3},"finance":{"tasks_today":22,"completed_today":21,"success_rate":95.5},"operations":{"tasks_today":33,"completed_today":31,"success_rate":93.9},"marketing":{"tasks_today":25,"completed_today":24,"success_rate":96.0},"hr":{"tasks_today":13,"completed_today":13,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":24,"success_rate":95.8},{"name":"Aisha Patel","department":"support","tasks":38,"success_rate":94.7},{"name":"Rohan Sharma","department":"sales","tasks":29,"success_rate":93.1}]'
),

-- Day 21
('demo-business-id', CURRENT_DATE - INTERVAL '9 days',
 17500, 70, 17, 29, 11.0, 90, 1.7, 96.2, 56,
 '{"support":{"tasks_today":74,"completed_today":70,"success_rate":94.6},"sales":{"tasks_today":47,"completed_today":43,"success_rate":91.5},"finance":{"tasks_today":23,"completed_today":22,"success_rate":95.7},"operations":{"tasks_today":34,"completed_today":32,"success_rate":94.1},"marketing":{"tasks_today":25,"completed_today":24,"success_rate":96.0},"hr":{"tasks_today":13,"completed_today":13,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":39,"success_rate":94.9},{"name":"Priya Nair","department":"finance","tasks":22,"success_rate":95.5},{"name":"Rohan Sharma","department":"sales","tasks":30,"success_rate":93.3}]'
),

-- Day 22
('demo-business-id', CURRENT_DATE - INTERVAL '8 days',
 18200, 72, 18, 30, 11.3, 92, 1.6, 96.5, 58,
 '{"support":{"tasks_today":75,"completed_today":72,"success_rate":96.0},"sales":{"tasks_today":48,"completed_today":44,"success_rate":91.7},"finance":{"tasks_today":23,"completed_today":22,"success_rate":95.7},"operations":{"tasks_today":35,"completed_today":33,"success_rate":94.3},"marketing":{"tasks_today":26,"completed_today":25,"success_rate":96.2},"hr":{"tasks_today":14,"completed_today":14,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":25,"success_rate":96.0},{"name":"Aisha Patel","department":"support","tasks":40,"success_rate":95.0},{"name":"Rohan Sharma","department":"sales","tasks":31,"success_rate":93.5}]'
),

-- Day 23
('demo-business-id', CURRENT_DATE - INTERVAL '7 days',
 19000, 74, 18, 31, 11.6, 95, 1.5, 96.8, 60,
 '{"support":{"tasks_today":77,"completed_today":73,"success_rate":94.8},"sales":{"tasks_today":49,"completed_today":45,"success_rate":91.8},"finance":{"tasks_today":24,"completed_today":23,"success_rate":95.8},"operations":{"tasks_today":36,"completed_today":34,"success_rate":94.4},"marketing":{"tasks_today":27,"completed_today":26,"success_rate":96.3},"hr":{"tasks_today":14,"completed_today":14,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":41,"success_rate":95.1},{"name":"Rohan Sharma","department":"sales","tasks":32,"success_rate":93.8},{"name":"Priya Nair","department":"finance","tasks":23,"success_rate":95.7}]'
),

-- Day 24
('demo-business-id', CURRENT_DATE - INTERVAL '6 days',
 19800, 75, 19, 32, 11.8, 96, 1.5, 97.0, 62,
 '{"support":{"tasks_today":78,"completed_today":75,"success_rate":96.2},"sales":{"tasks_today":50,"completed_today":46,"success_rate":92.0},"finance":{"tasks_today":24,"completed_today":23,"success_rate":95.8},"operations":{"tasks_today":36,"completed_today":35,"success_rate":97.2},"marketing":{"tasks_today":27,"completed_today":26,"success_rate":96.3},"hr":{"tasks_today":14,"completed_today":14,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":27,"success_rate":96.3},{"name":"Aisha Patel","department":"support","tasks":42,"success_rate":95.2},{"name":"Rohan Sharma","department":"sales","tasks":33,"success_rate":93.9}]'
),

-- Day 25
('demo-business-id', CURRENT_DATE - INTERVAL '5 days',
 20500, 76, 19, 33, 12.0, 98, 1.4, 97.2, 64,
 '{"support":{"tasks_today":80,"completed_today":76,"success_rate":95.0},"sales":{"tasks_today":51,"completed_today":47,"success_rate":92.2},"finance":{"tasks_today":25,"completed_today":24,"success_rate":96.0},"operations":{"tasks_today":37,"completed_today":35,"success_rate":94.6},"marketing":{"tasks_today":28,"completed_today":27,"success_rate":96.4},"hr":{"tasks_today":15,"completed_today":15,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":43,"success_rate":95.3},{"name":"Priya Nair","department":"finance","tasks":24,"success_rate":95.8},{"name":"Rohan Sharma","department":"sales","tasks":34,"success_rate":94.1}]'
),

-- Day 26
('demo-business-id', CURRENT_DATE - INTERVAL '4 days',
 21200, 78, 20, 34, 12.2, 100, 1.4, 97.5, 66,
 '{"support":{"tasks_today":82,"completed_today":78,"success_rate":95.1},"sales":{"tasks_today":52,"completed_today":48,"success_rate":92.3},"finance":{"tasks_today":25,"completed_today":24,"success_rate":96.0},"operations":{"tasks_today":38,"completed_today":36,"success_rate":94.7},"marketing":{"tasks_today":28,"completed_today":27,"success_rate":96.4},"hr":{"tasks_today":15,"completed_today":15,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":28,"success_rate":96.4},{"name":"Aisha Patel","department":"support","tasks":44,"success_rate":95.5},{"name":"Rohan Sharma","department":"sales","tasks":35,"success_rate":94.3}]'
),

-- Day 27
('demo-business-id', CURRENT_DATE - INTERVAL '3 days',
 22000, 79, 20, 35, 12.4, 102, 1.3, 97.8, 68,
 '{"support":{"tasks_today":83,"completed_today":80,"success_rate":96.4},"sales":{"tasks_today":53,"completed_today":49,"success_rate":92.5},"finance":{"tasks_today":26,"completed_today":25,"success_rate":96.2},"operations":{"tasks_today":39,"completed_today":37,"success_rate":94.9},"marketing":{"tasks_today":29,"completed_today":28,"success_rate":96.6},"hr":{"tasks_today":15,"completed_today":15,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":45,"success_rate":95.6},{"name":"Rohan Sharma","department":"sales","tasks":36,"success_rate":94.4},{"name":"Priya Nair","department":"finance","tasks":25,"success_rate":96.0}]'
),

-- Day 28
('demo-business-id', CURRENT_DATE - INTERVAL '2 days',
 23000, 80, 21, 36, 12.6, 105, 1.3, 98.0, 70,
 '{"support":{"tasks_today":85,"completed_today":82,"success_rate":96.5},"sales":{"tasks_today":54,"completed_today":50,"success_rate":92.6},"finance":{"tasks_today":26,"completed_today":25,"success_rate":96.2},"operations":{"tasks_today":40,"completed_today":38,"success_rate":95.0},"marketing":{"tasks_today":30,"completed_today":29,"success_rate":96.7},"hr":{"tasks_today":16,"completed_today":16,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":30,"success_rate":96.7},{"name":"Aisha Patel","department":"support","tasks":46,"success_rate":95.7},{"name":"Rohan Sharma","department":"sales","tasks":37,"success_rate":94.6}]'
),

-- Day 29
('demo-business-id', CURRENT_DATE - INTERVAL '1 day',
 24000, 80, 22, 37, 12.8, 108, 1.2, 98.2, 72,
 '{"support":{"tasks_today":86,"completed_today":83,"success_rate":96.5},"sales":{"tasks_today":55,"completed_today":51,"success_rate":92.7},"finance":{"tasks_today":27,"completed_today":26,"success_rate":96.3},"operations":{"tasks_today":41,"completed_today":39,"success_rate":95.1},"marketing":{"tasks_today":30,"completed_today":29,"success_rate":96.7},"hr":{"tasks_today":16,"completed_today":16,"success_rate":100.0}}',
 '[{"name":"Aisha Patel","department":"support","tasks":47,"success_rate":95.7},{"name":"Priya Nair","department":"finance","tasks":26,"success_rate":96.2},{"name":"Rohan Sharma","department":"sales","tasks":38,"success_rate":94.7}]'
),

-- Day 30 (today)
('demo-business-id', CURRENT_DATE,
 25000, 80, 22, 38, 13.0, 110, 1.2, 98.5, 75,
 '{"support":{"tasks_today":88,"completed_today":85,"success_rate":96.6},"sales":{"tasks_today":56,"completed_today":52,"success_rate":92.9},"finance":{"tasks_today":27,"completed_today":26,"success_rate":96.3},"operations":{"tasks_today":42,"completed_today":40,"success_rate":95.2},"marketing":{"tasks_today":31,"completed_today":30,"success_rate":96.8},"hr":{"tasks_today":16,"completed_today":16,"success_rate":100.0}}',
 '[{"name":"Vikram Rao","department":"operations","tasks":32,"success_rate":96.9},{"name":"Aisha Patel","department":"support","tasks":48,"success_rate":95.8},{"name":"Rohan Sharma","department":"sales","tasks":39,"success_rate":94.9}]'
);
