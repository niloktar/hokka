import { useState, useEffect, useRef } from 'react';
import { getPositionFromOffset } from './constants';

/**
 * CursorOverlay — Uzak kullanıcı imleçlerini hayvan emojisi + isimle gösterir
 */
export default function CursorOverlay({ remoteUsers, editorRef }) {
  const [positions, setPositions] = useState([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const updatePositions = () => {
      if (!editorRef.current || remoteUsers.length === 0) {
        setPositions([]);
        return;
      }

      const newPositions = remoteUsers
        .filter(u => u.cursor && typeof u.cursor.offset === 'number')
        .map(user => {
          const pos = getPositionFromOffset(editorRef.current, user.cursor.offset);
          if (!pos) return null;
          return {
            clientId: user.clientId,
            name: user.name,
            color: user.color,
            animal: user.animal || '🐾',
            permission: user.permission || 'edit',
            top: pos.top,
            left: pos.left,
            height: pos.height,
          };
        })
        .filter(Boolean);

      setPositions(newPositions);
    };

    updatePositions();

    const editor = editorRef.current;
    const scrollContainer = editor?.closest('main');

    const handleUpdate = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePositions);
    };

    scrollContainer?.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      scrollContainer?.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [remoteUsers, editorRef]);

  if (positions.length === 0) return null;

  return (
    <>
      {positions.map(cursor => (
        <div
          key={cursor.clientId}
          className={`collab-cursor ${cursor.permission === 'view' ? 'collab-cursor-view' : ''}`}
          style={{
            top: cursor.top,
            left: cursor.left,
            height: cursor.height,
            backgroundColor: cursor.color,
          }}
        >
          <span
            className="collab-cursor-label"
            style={{ backgroundColor: cursor.color }}
          >
            <span className="collab-cursor-animal">{cursor.animal}</span>
            {cursor.name}
          </span>
        </div>
      ))}
    </>
  );
}
