
export async function GET() {
  const now = new Date().toISOString();

  const mockPosts = [
    {
      id: "post1",
      platform: "Twitter",
      post: "#floodrelief Need food in NYC urgently!",
      user: "@citizen1",
      created_at: now,
    },
    {
      id: "post2",
      platform: "Bluesky",
      post: "Flooded streets in Chennai. Power outage since 12am.",
      user: "@groundzero",
      created_at: now,
    },
    {
      id: "post3",
      platform: "Twitter",
      post: "Rescue ops started near Bandra East #rescue",
      user: "@relief_bot",
      created_at: now,
    },
    {
      id: "post4",
      platform: "Twitter",
      post: "#earthquake hit early morning in Kathmandu. Stay safe.",
      user: "@quakeAlert",
      created_at: now,
    },
  ];

  return new Response(JSON.stringify(mockPosts), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
