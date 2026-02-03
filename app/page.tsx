import ImageGallery from "@/components/ImageGallery";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <main className="container mx-auto">
        <ImageGallery />
      </main>
    </div>
  );
}
