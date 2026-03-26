import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// ── Types ──────────────────────────────────────────────────────

interface DragWord {
  id: string;
  text: string;
}

interface SentenceOrderGameProps {
  mode: 'sentence_order';
  words: string[];         // shuffled
  correctOrder: number[];  // indices in correct order
  translation?: string;
  onComplete: (correct: boolean) => void;
}

interface CategorySortGameProps {
  mode: 'category_sort';
  items: { id: string; text: string; category: string }[];
  categories: string[];
  onComplete: (score: number, total: number) => void;
}

type DragDropGameProps = SentenceOrderGameProps | CategorySortGameProps;

// ── Sentence Order Mode ────────────────────────────────────────

function SentenceOrderGame({ words, correctOrder, translation, onComplete }: SentenceOrderGameProps) {
  const [order, setOrder] = useState<DragWord[]>(
    words.map((w, i) => ({ id: `word-${i}`, text: w }))
  );
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = order.findIndex((w) => w.id === active.id);
      const newIdx = order.findIndex((w) => w.id === over.id);
      setOrder(arrayMove(order, oldIdx, newIdx));
    }
  };

  const checkAnswer = () => {
    // Build correct order based on original word indices
    const correctSentence = correctOrder.map((i) => words[i]).join(' ');
    const userSentence = order.map((w) => w.text).join(' ');
    const correct = userSentence === correctSentence;
    setIsCorrect(correct);
    setSubmitted(true);
    onComplete(correct);
  };

  const reset = () => {
    setOrder(words.map((w, i) => ({ id: `word-${i}`, text: w })));
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 text-center">Sleep de woorden in de juiste volgorde</p>

      {translation && (
        <div className="bg-dutch-cream rounded-xl p-4 text-sm text-gray-700 text-center">
          <span className="font-medium">Betekenis: </span>{translation}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order.map((w) => w.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2 min-h-14 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            {order.map((word) => (
              <SortableWord
                key={word.id}
                id={word.id}
                text={word.text}
                disabled={submitted}
                highlight={
                  submitted
                    ? isCorrect
                      ? 'correct'
                      : 'wrong'
                    : 'none'
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              'rounded-xl p-4 text-sm font-medium',
              isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}
          >
            {isCorrect
              ? '✅ Correct! Goed gedaan!'
              : `❌ Onjuist. De juiste volgorde: "${correctOrder.map((i) => words[i]).join(' ')}"`}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        {!submitted ? (
          <button onClick={checkAnswer} className="btn-primary flex-1">
            ✓ Controleer
          </button>
        ) : (
          <button onClick={reset} className="btn-secondary flex-1">
            🔄 Opnieuw
          </button>
        )}
      </div>
    </div>
  );
}

// ── Category Sort Mode ─────────────────────────────────────────

function CategorySortGame({ items, categories, onComplete }: CategorySortGameProps) {
  const [buckets, setBuckets] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(categories.map((c) => [c, []]))
  );
  const [remaining, setRemaining] = useState(items.map((i) => i.id));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const dropIntoBucket = (itemId: string, category: string) => {
    if (submitted) return;
    setRemaining((prev) => prev.filter((id) => id !== itemId));
    setBuckets((prev) => ({
      ...prev,
      [category]: [...prev[category], itemId],
    }));
  };

  const returnToPool = (itemId: string, fromCategory: string) => {
    if (submitted) return;
    setBuckets((prev) => ({
      ...prev,
      [fromCategory]: prev[fromCategory].filter((id) => id !== itemId),
    }));
    setRemaining((prev) => [...prev, itemId]);
  };

  const checkAnswers = () => {
    let correct = 0;
    categories.forEach((cat) => {
      buckets[cat].forEach((itemId) => {
        const item = items.find((i) => i.id === itemId);
        if (item?.category === cat) correct++;
      });
    });
    setScore(correct);
    setSubmitted(true);
    onComplete(correct, items.length);
  };

  const getItem = (id: string) => items.find((i) => i.id === id);
  const isPlaced = remaining.length === 0;

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500 text-center">Sleep elk woord naar de juiste categorie</p>

      {/* Word pool */}
      {remaining.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4 min-h-12">
          <p className="text-xs text-gray-400 mb-2">Woordenbank</p>
          <div className="flex flex-wrap gap-2">
            {remaining.map((id) => {
              const item = getItem(id);
              return (
                <div key={id} className="relative group">
                  <span className="inline-block bg-white border-2 border-dutch-blue text-dutch-blue font-medium text-sm px-3 py-1.5 rounded-lg cursor-grab">
                    {item?.text}
                  </span>
                  <div className="absolute top-full left-0 mt-1 z-10 hidden group-hover:flex flex-wrap gap-1 bg-white rounded-xl shadow-lg p-2 border border-gray-100 min-w-max">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => dropIntoBucket(id, cat)}
                        className="text-xs bg-dutch-cream hover:bg-dutch-blue hover:text-white px-2 py-1 rounded-lg transition-colors"
                      >
                        → {cat}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category buckets */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat} className="bg-white border-2 border-gray-100 rounded-2xl p-3 min-h-24">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {buckets[cat].map((id) => {
                const item = getItem(id);
                const correct = submitted && item?.category === cat;
                const wrong = submitted && item?.category !== cat;
                return (
                  <button
                    key={id}
                    onClick={() => returnToPool(id, cat)}
                    disabled={submitted}
                    className={clsx(
                      'text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors',
                      correct && 'bg-green-100 text-green-700',
                      wrong && 'bg-red-100 text-red-700',
                      !submitted && 'bg-dutch-cream text-gray-700 hover:bg-red-50'
                    )}
                  >
                    {item?.text}
                    {correct && ' ✓'}
                    {wrong && ' ✗'}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {submitted && (
        <div className="card text-center">
          <p className="font-bold text-lg text-gray-900">{score}/{items.length} correct</p>
          <p className="text-gray-500 text-sm">{Math.round((score / items.length) * 100)}%</p>
        </div>
      )}

      {!submitted && isPlaced && (
        <button onClick={checkAnswers} className="btn-primary w-full">
          ✓ Controleer antwoorden
        </button>
      )}
    </div>
  );
}

// ── Sortable Word (for sentence order) ──────────────────────────

function SortableWord({
  id,
  text,
  disabled,
  highlight,
}: {
  id: string;
  text: string;
  disabled: boolean;
  highlight: 'correct' | 'wrong' | 'none';
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!disabled ? listeners : {})}
    >
      <span
        className={clsx(
          'inline-block font-semibold px-3 py-2 rounded-xl border-2 text-sm select-none',
          isDragging && 'shadow-lg scale-105',
          highlight === 'correct' && 'bg-green-100 border-green-400 text-green-800',
          highlight === 'wrong' && 'bg-red-100 border-red-400 text-red-800',
          highlight === 'none' && !disabled && 'bg-dutch-blue text-white border-dutch-blue cursor-grab',
          highlight === 'none' && disabled && 'bg-gray-100 text-gray-600 border-gray-200'
        )}
      >
        {text}
      </span>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────

export default function DragDropGame(props: DragDropGameProps) {
  if (props.mode === 'sentence_order') {
    return <SentenceOrderGame {...props} />;
  }
  return <CategorySortGame {...props} />;
}
