import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { MatchingOptions } from '@/types';
import { exercisesApi } from '@/api/client';

interface MatchingPair {
  dutch: string;
  translation: string;
  translation_fa?: string;
}

interface MatchingGameProps {
  pairs: MatchingPair[];
  exerciseId?: number;
  languagePref: 'en' | 'fa';
  onComplete: (score: number, total: number) => void;
}

type TileType = 'dutch' | 'translation';

interface Tile {
  id: string;
  text: string;
  type: TileType;
  pairIndex: number;
  matched: boolean;
  selected: boolean;
  wrong: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MatchingGame({ pairs, exerciseId, languagePref, onComplete }: MatchingGameProps) {
  const buildTiles = useCallback((): Tile[] => {
    const dutch = shuffle(pairs.map((p, i) => ({
      id: `d-${i}`, text: p.dutch, type: 'dutch' as TileType,
      pairIndex: i, matched: false, selected: false, wrong: false,
    })));
    const translations = shuffle(pairs.map((p, i) => ({
      id: `t-${i}`,
      text: languagePref === 'fa' && p.translation_fa ? p.translation_fa : p.translation,
      type: 'translation' as TileType,
      pairIndex: i, matched: false, selected: false, wrong: false,
    })));
    return [...dutch, ...translations];
  }, [pairs, languagePref]);

  const [tiles, setTiles] = useState<Tile[]>(buildTiles());
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const handleTileClick = useCallback(async (tile: Tile) => {
    if (tile.matched || tile.selected) return;

    if (!selectedTile) {
      // First selection
      setTiles((prev) =>
        prev.map((t) => (t.id === tile.id ? { ...t, selected: true } : t))
      );
      setSelectedTile(tile);
      return;
    }

    // Second selection
    setAttempts((a) => a + 1);
    const isMatch =
      selectedTile.pairIndex === tile.pairIndex &&
      selectedTile.type !== tile.type;

    if (isMatch) {
      const newMatchedCount = matchedCount + 1;
      setMatchedCount(newMatchedCount);
      setScore((s) => s + 1);

      setTiles((prev) =>
        prev.map((t) =>
          t.id === tile.id || t.id === selectedTile.id
            ? { ...t, matched: true, selected: false }
            : t
        )
      );

      if (exerciseId) {
        try {
          await exercisesApi.submitAttempt(exerciseId, { correct: true });
        } catch { /* non-blocking */ }
      }

      if (newMatchedCount === pairs.length) {
        setIsDone(true);
        onComplete(newMatchedCount, pairs.length);
      }
    } else {
      // Wrong — flash red then deselect
      setTiles((prev) =>
        prev.map((t) =>
          t.id === tile.id || t.id === selectedTile.id
            ? { ...t, wrong: true, selected: false }
            : t
        )
      );
      setTimeout(() => {
        setTiles((prev) =>
          prev.map((t) => ({ ...t, wrong: false }))
        );
      }, 600);
    }

    setSelectedTile(null);
  }, [selectedTile, matchedCount, pairs.length, exerciseId, onComplete]);

  const restart = () => {
    setTiles(buildTiles());
    setSelectedTile(null);
    setMatchedCount(0);
    setIsDone(false);
    setScore(0);
    setAttempts(0);
  };

  if (isDone) {
    const pct = Math.round((score / attempts) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-6xl">{pct >= 80 ? '🎉' : '💪'}</div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-gray-900">
            Alle {pairs.length} paren gevonden!
          </p>
          <p className="text-gray-500 mt-1">{attempts} pogingen — {pct}% nauwkeurig</p>
        </div>
        <button onClick={restart} className="btn-secondary">🔄 Opnieuw spelen</button>
      </div>
    );
  }

  const dutchTiles = tiles.filter((t) => t.type === 'dutch');
  const translationTiles = tiles.filter((t) => t.type === 'translation');

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">
        Koppel het Nederlandse woord aan de vertaling · {matchedCount}/{pairs.length} gevonden
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Dutch column */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase text-center mb-2">🇳🇱 Nederlands</p>
          {dutchTiles.map((tile) => (
            <TileButton key={tile.id} tile={tile} onClick={() => handleTileClick(tile)} />
          ))}
        </div>
        {/* Translation column */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase text-center mb-2">
            {languagePref === 'fa' ? '🇮🇷 فارسی' : '🇬🇧 English'}
          </p>
          {translationTiles.map((tile) => (
            <TileButton key={tile.id} tile={tile} onClick={() => handleTileClick(tile)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TileButton({ tile, onClick }: { tile: Tile; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={tile.matched}
      animate={tile.wrong ? { x: [-4, 4, -4, 4, 0] } : {}}
      transition={{ duration: 0.3 }}
      className={clsx(
        'w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-150 text-left border-2',
        tile.matched && 'bg-green-50 border-green-300 text-green-700 opacity-60 cursor-default',
        tile.selected && !tile.matched && 'bg-dutch-blue border-dutch-blue text-white scale-105',
        tile.wrong && 'bg-red-50 border-red-300 text-red-700',
        !tile.matched && !tile.selected && !tile.wrong &&
          'bg-white border-gray-200 text-gray-800 hover:border-dutch-blue hover:bg-blue-50 cursor-pointer'
      )}
    >
      {tile.matched ? '✓ ' : ''}{tile.text}
    </motion.button>
  );
}
