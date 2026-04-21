import { useMemo } from 'react';
import { AppHeader } from '../../components/ui/AppHeader';
import { GenreGroup } from './GenreGroup';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tag as TagIcon } from '@phosphor-icons/react';
import { useGenres } from './useGenres';
import { useSongs } from '../songs/useSongs';
import { useFilterStore } from '../../stores/filters';
import { StaggerList } from '../../components/motion/StaggerList';

export const GenresTab = () => {
  const { genres } = useGenres();
  const { songs } = useSongs();
  const { genres: filter } = useFilterStore();

  const grouped = useMemo(() => {
    return genres
      .map(genre => ({ genre, songs: songs.filter(s => s.genreId === genre.id) }))
      .filter(({ songs: gs }) => filter.showEmpty || gs.length > 0)
      .sort((a, b) => {
        if (filter.sort === 'count') return b.songs.length - a.songs.length;
        if (filter.sort === 'name') return a.genre.name.localeCompare(b.genre.name);
        return a.genre.order - b.genre.order;
      });
  }, [genres, songs, filter]);

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        eyebrow={`by genre · ${genres.length} categories`}
        title="Genres"
      />
      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-3">
        {grouped.length === 0 ? (
          <EmptyState
            icon={<TagIcon size={28} />}
            title="No genres"
            description="Songs grouped by genre appear here."
          />
        ) : (
          <StaggerList>
            {grouped.map(({ genre, songs: gs }) => (
              <GenreGroup key={genre.id} genre={genre} songs={gs} />
            ))}
          </StaggerList>
        )}
      </div>
    </div>
  );
};
