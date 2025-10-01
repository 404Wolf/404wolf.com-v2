interface LinkButtonProps {
  text: string;
  href: string;
}

export function LinkButton({ text, href }: LinkButtonProps) {
  return (
    <a
      href={href}
      className="inline-block px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
    >
      {text}
    </a>
  );
}
