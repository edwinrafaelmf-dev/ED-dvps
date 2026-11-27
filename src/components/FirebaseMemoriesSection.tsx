import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { Check, LogIn, LogOut, Pencil, Send, Trash2 } from 'lucide-react';
import { ADMIN_EMAIL, auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';

export type FavoriteMoment = 'itazura' | 'te_odio' | 'me_encantas';

export interface SavedMemory {
  id: string;
  ownerId: string;
  authorName: string;
  replyMessage: string;
  noAttemptsCount: number;
  favoriteMoment: FavoriteMoment;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

const MOMENT_LABELS: Record<FavoriteMoment, string> = {
  itazura: 'No quiero que vuelvas a llorar',
  te_odio: '¡Te odio mucho, lo sabes!',
  me_encantas: '¡Me encantas!',
};

interface FirebaseMemoriesSectionProps {
  noAttemptsCount: number;
}

export function FirebaseMemoriesSection({ noAttemptsCount }: FirebaseMemoriesSectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  const [memories, setMemories] = useState<SavedMemory[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);

  const [replyMessage, setReplyMessage] = useState('');
  const [favoriteMoment, setFavoriteMoment] = useState<FavoriteMoment>('me_encantas');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  if (asyncError) {
    throw asyncError;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !user) {
      setMemories([]);
      setLoadingMemories(false);
      return;
    }

    setLoadingMemories(true);
    const isAdmin = user.email === ADMIN_EMAIL && user.emailVerified;
    const memoriesRef = collection(db, 'memories');
    const q = isAdmin
      ? query(memoriesRef)
      : query(memoriesRef, where('ownerId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: SavedMemory[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ownerId: String(data.ownerId ?? ''),
            authorName: String(data.authorName ?? 'Marie'),
            replyMessage: String(data.replyMessage ?? ''),
            noAttemptsCount: Number(data.noAttemptsCount ?? 0),
            favoriteMoment:
              data.favoriteMoment === 'itazura' ||
              data.favoriteMoment === 'te_odio' ||
              data.favoriteMoment === 'me_encantas'
                ? data.favoriteMoment
                : 'me_encantas',
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
          };
        });

        items.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() ?? 0;
          const timeB = b.createdAt?.toMillis?.() ?? 0;
          return timeB - timeA;
        });

        setMemories(items);
        setLoadingMemories(false);
      },
      (error) => {
        setLoadingMemories(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'memories');
        } catch (wrapped) {
          setAsyncError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError('No se pudo iniciar sesión con Google. Intenta de nuevo.');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanReply = replyMessage.trim().slice(0, 400);
    if (!cleanReply) return;

    const cleanAuthor = (user.displayName || user.email?.split('@')[0] || 'Marie')
      .trim()
      .slice(0, 80);
    const boundedAttempts = Math.min(Math.max(Math.round(noAttemptsCount), 0), 10000);
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const path = `memories/${memoryId}`;

    setSaving(true);
    setSavedNotice(false);
    try {
      await setDoc(doc(db, 'memories', memoryId), {
        ownerId: user.uid,
        authorName: cleanAuthor || 'Marie',
        replyMessage: cleanReply,
        noAttemptsCount: boundedAttempts,
        favoriteMoment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setReplyMessage('');
      setSavedNotice(true);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (wrapped) {
        setAsyncError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMemory = async (item: SavedMemory) => {
    const cleanReply = editingText.trim().slice(0, 400);
    if (!cleanReply) return;
    const path = `memories/${item.id}`;
    try {
      await updateDoc(doc(db, 'memories', item.id), {
        replyMessage: cleanReply,
        favoriteMoment: item.favoriteMoment,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
      setEditingText('');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } catch (wrapped) {
        setAsyncError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  const handleDeleteMemory = async (id: string) => {
    const path = `memories/${id}`;
    try {
      await deleteDoc(doc(db, 'memories', id));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, path);
      } catch (wrapped) {
        setAsyncError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  if (!authReady) {
    return null;
  }

  return (
    <div className="mt-7 border-t border-white/12 pt-6">
      {!user ? (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-[#E7C6D4]">
            ¿Quieres dejarle una respuesta a Edwin y guardar este recuerdo en Firebase?
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSignIn}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#1F171A] shadow-sm transition-colors hover:bg-[#FAF4F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FB7185] cursor-pointer"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>Conectar con Google</span>
            </button>
          </div>
          {authError && <p className="text-xs text-[#FDA4AF]">{authError}</p>}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#E7C6D4]">
              <span>Conectado como </span>
              <span className="font-semibold text-[#FFFDFC]">
                {user.displayName || user.email}
              </span>
              <span aria-hidden="true"> · </span>
              <span className="tabular-nums">Intentos en «No»: {noAttemptsCount}</span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex min-h-[44px] sm:min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/15 px-3.5 py-2 sm:px-3 sm:py-1.5 text-xs font-medium text-[#E7C6D4] transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </div>

          <form onSubmit={handleSaveMemory} className="space-y-3.5">
            <div>
              <label htmlFor="marie-reply" className="block text-xs font-medium text-[#E7C6D4]">
                Tu respuesta para Edwin
              </label>
              <textarea
                id="marie-reply"
                rows={2}
                maxLength={400}
                required
                value={replyMessage}
                onChange={(e) => {
                  setReplyMessage(e.target.value);
                  setSavedNotice(false);
                }}
                placeholder="Escribe lo que quieras decirle..."
                className="mt-1.5 w-full rounded-xl border border-white/18 bg-white/6 px-3.5 py-2.5 text-base sm:text-sm text-[#FFFDFC] placeholder:text-[#C4A8B5] focus:border-[#FB7185] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <label htmlFor="favorite-moment" className="block text-xs font-medium text-[#E7C6D4]">
                  Momento favorito
                </label>
                <select
                  id="favorite-moment"
                  value={favoriteMoment}
                  onChange={(e) => setFavoriteMoment(e.target.value as FavoriteMoment)}
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/18 bg-[#1E1526] px-3.5 py-2.5 text-base sm:text-sm text-[#FFFDFC] focus:border-[#FB7185] focus:outline-none"
                >
                  <option value="me_encantas">¡Me encantas!</option>
                  <option value="itazura">No quiero que vuelvas a llorar</option>
                  <option value="te_odio">¡Te odio mucho, lo sabes!</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving || !replyMessage.trim()}
                className="inline-flex min-h-[48px] sm:min-h-[44px] w-full sm:w-auto shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#BE185D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9D174D] disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>{saving ? 'Guardando...' : 'Guardar recuerdo'}</span>
              </button>
            </div>

            {savedNotice && (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FDA4AF]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Recuerdo guardado en Firebase.</span>
              </p>
            )}
          </form>

          {/* Saved Memories List */}
          {loadingMemories ? (
            <p className="text-xs text-[#C4A8B5]">Cargando recuerdos...</p>
          ) : memories.length > 0 ? (
            <div className="space-y-2.5 pt-2">
              <h2 className="text-xs font-semibold tracking-wide text-[#E7C6D4]">
                Recuerdos guardados
              </h2>
              <div className="max-h-52 space-y-2.5 overflow-y-auto pr-1">
                {memories.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/12 bg-white/5 p-3.5 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs text-[#E7C6D4]">
                      <span className="leading-relaxed">
                        <span className="font-semibold text-[#FFFDFC]">{item.authorName}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{MOMENT_LABELS[item.favoriteMoment]}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="tabular-nums">{item.noAttemptsCount} intentos en «No»</span>
                      </span>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditingText(item.replyMessage);
                          }}
                          aria-label="Editar respuesta"
                          className="flex min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] items-center justify-center rounded-lg text-[#E7C6D4] hover:bg-white/10 hover:text-white cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMemory(item.id)}
                          aria-label="Eliminar respuesta"
                          className="flex min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] items-center justify-center rounded-lg text-[#E7C6D4] hover:bg-white/10 hover:text-[#FDA4AF] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {editingId === item.id ? (
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          maxLength={400}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 rounded-lg border border-white/20 bg-[#1A1221] px-3 py-2 text-base sm:text-xs text-white focus:border-[#FB7185] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateMemory(item)}
                          className="min-h-[44px] sm:min-h-[34px] rounded-lg bg-[#BE185D] px-4 py-2 text-xs font-medium text-white hover:bg-[#9D174D] cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-sm leading-relaxed text-[#FFFDFC]">
                        {item.replyMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
