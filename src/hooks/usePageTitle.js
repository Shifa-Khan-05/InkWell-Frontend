import { useEffect } from 'react';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `InkWell | ${title}` : 'InkWell';
  }, [title]);
};

export default usePageTitle;
