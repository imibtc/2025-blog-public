// app/api/comment-count/route.js
export async function GET() {
  try {
    const response = await fetch('https://comments.hdxiaoke.top/api/comment/count');
    const data = await response.json();
    
    return new Response(JSON.stringify({ 
      success: true, 
      count: data.data || data 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      count: 0 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
