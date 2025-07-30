import React, { useState, useContext } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Filter, Eye, Image as ImageIcon } from 'lucide-react';
import { AppContext } from '@/contexts/AppContext';

const PortfolioPage: React.FC = () => {
  const { portfolioItems, categories } = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredItems = selectedCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            Portfolio
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Explore my collection of digital artwork and creative projects
          </p>
          
          {/* Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by category:</span>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 glass-card">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Badge variant="outline" className="text-sm">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </Badge>
        </div>

        {/* Portfolio Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filteredItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="glass-card hover-lift group overflow-hidden cursor-pointer"
                onClick={() => openModal(item)}
              >
                <div className="aspect-square relative">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${1500 + index}x1500/?art,digital,illustration`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                      <p className="text-white/80 text-sm mb-2">{item.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="secondary" size="icon" className="shadow-lg">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-8xl mb-6 animate-float">🎨</div>
            <h2 className="text-3xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
              Portfolio in Construction
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              New works coming soon! Stay tuned for amazing artwork.
            </p>
            <div className="flex justify-center">
              <Card className="glass-card p-8 max-w-md">
                <CardContent className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    I'm working hard to showcase my best artwork here. 
                    Check back soon for updates!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredItems.length > 12 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Artwork
            </Button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-background/95 backdrop-blur-md">
          {selectedItem && (
            <div className="relative">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl gradient-primary bg-clip-text text-transparent">
                  {selectedItem.title}
                </DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Badge variant="outline">{selectedItem.category}</Badge>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
                    {selectedItem.description}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioPage;