// Public Menu Page - Restaurant ordering interface
// No authentication required - works on mobile/iOS
import { Metadata } from 'next';
import PublicMenuClient from './client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Fetch restaurant data
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  try {
    const res = await fetch(`${baseUrl}/api/public/restaurant/${slug}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const restaurant = data.data;
      return {
        title: `${restaurant.name} - Commander en ligne`,
        description: restaurant.description || `Commandez chez ${restaurant.name} - Livraison et emporté`,
        openGraph: {
          title: `${restaurant.name} - Menu`,
          description: restaurant.description,
          images: restaurant.coverImage ? [restaurant.coverImage] : [],
        },
      };
    }
  } catch {
    // Fallback metadata
  }

  return {
    title: 'Menu - Commander en ligne',
    description: 'Commandez vos plats préférés en ligne',
  };
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;
  return <PublicMenuClient slug={slug} />;
}
