export const Footer = () => {
  return (
    <footer className="mt-16 py-8 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-zinc-500">
            Built by Petar Nikolić · Commissioned for Nathan Fonteijn
          </p>
          <p className="text-xs text-zinc-400">
            Suggestions and business contact: {' '}
            <a 
              href="https://pnikolic-dev.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              pnikolic-dev.vercel.app
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};