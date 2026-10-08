import { useEffect } from 'react';
export default function usePageTitle(title) {
  useEffect(() => { document.title = title ? `${title} | Kaamnama` : 'Kaamnama - a written record of work done'; }, [title]);
}
