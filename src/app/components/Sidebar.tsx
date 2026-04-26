import { Board } from '../utils/api';

interface SidebarProps {
  boards: Board[];
  activeBoard: string;
  onBoardChange: (boardId: string) => void;
  postCounts: Record<string, number>;
}

export function Sidebar({ boards, activeBoard, onBoardChange, postCounts }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border/40 bg-gradient-to-b from-muted/30 to-background sticky top-0 h-screen overflow-y-auto">
      <div className="p-4 border-b border-border/40 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <img
            src="/src/imports/anon_boards_logo.svg"
            alt="Anon Boards"
            className="w-10 h-10"
          />
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '0.15em' }}>
              ANON BOARDS
            </h3>
            <p className="text-[10px] text-muted-foreground tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              TALK HERE INCOGNITO
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <p className="text-xs text-muted-foreground">Choose a topic to explore</p>
        </div>
      </div>

      <div className="py-2">
        <button
          onClick={() => onBoardChange('all')}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all border-l-2 ${
            activeBoard === 'all'
              ? 'bg-primary/10 border-primary text-primary font-medium'
              : 'border-transparent hover:bg-muted/50 hover:border-muted-foreground/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🌐</span>
            <span>All Boards</span>
          </div>
          <span className="text-xs bg-muted/50 px-2 py-0.5 rounded-full">
            {Object.values(postCounts).reduce((a, b) => a + b, 0)}
          </span>
        </button>

        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => onBoardChange(board.id)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all border-l-2 ${
              activeBoard === board.id
                ? 'bg-primary/10 border-primary text-primary font-medium'
                : 'border-transparent hover:bg-muted/50 hover:border-muted-foreground/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{board.icon}</span>
              <span>{board.name}</span>
            </div>
            <span className="text-xs bg-muted/50 px-2 py-0.5 rounded-full">
              {postCounts[board.id] || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-border/40 mt-4">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            100% Anonymous
          </p>
          <p className="text-[10px] leading-relaxed">
            Posts are tied to session IDs, not IP addresses. Your privacy is protected.
          </p>
        </div>
      </div>
    </aside>
  );
}
