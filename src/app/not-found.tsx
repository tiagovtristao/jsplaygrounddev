import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-full text-[#4d4d4d] flex justify-center items-center">
      <p>
        Page not found. Go to{' '}
        <Link className="text-[#0076cf] hover:underline" href="/">
          JavaScript Playground
        </Link>
        .
      </p>
    </div>
  );
}
