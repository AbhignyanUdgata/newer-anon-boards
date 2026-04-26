import { MessageSquare, Heart, Share2, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface BoardCardProps {
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  timestamp: string;
  trending?: boolean;
}

export function BoardCard({
  title,
  content,
  category,
  likes,
  comments,
  timestamp,
  trending
}: BoardCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 backdrop-blur-sm bg-card/80 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10">
            {category}
          </Badge>
          {trending && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
        <span className="text-muted-foreground text-sm">{timestamp}</span>
      </div>

      <h3 className="mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground mb-4 line-clamp-3">{content}</p>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2 hover:text-rose-500 transition-colors">
            <Heart className="w-4 h-4" />
            <span>{likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:text-primary transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{comments}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 hover:text-primary transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </Card>
  );
}
