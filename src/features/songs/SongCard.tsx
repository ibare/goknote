import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import type { Song, Genre } from '../../types';

interface SongCardProps {
  song: Song;
  genre?: Genre;
  onLongPress?: () => void;
}

export const SongCard = ({ song, genre, onLongPress }: SongCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/songs/${song.id}`)}
      onLongPress={onLongPress}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold truncate">{song.title}</p>
          <p className="text-[13px] text-ink-2 mt-0.5">{song.artist}</p>
        </div>
        {genre && <Tag label={genre.name} color={genre.color} />}
      </div>
      {song.note && (
        <p className="text-[13px] text-ink-2 mt-2 line-clamp-2">{song.note}</p>
      )}
    </Card>
  );
};
