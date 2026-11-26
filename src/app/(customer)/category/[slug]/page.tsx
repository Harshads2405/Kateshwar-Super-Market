export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <main className="mx-auto max-w-5xl p-6"><h1 className="text-2xl font-bold">Category: {slug}</h1></main>;
}
