export const onRequestGet = async ({ data }) => {
  return new Response(JSON.stringify(data.user), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};