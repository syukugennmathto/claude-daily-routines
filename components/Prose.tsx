export default function Prose({ paragraphs, className = "" }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={`prose-editorial max-w-reading text-[15px] md:text-base ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
