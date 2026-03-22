import { useQuery } from '@tanstack/react-query'
import { 
    FileText, Download, Calendar, HardDrive, 
    Search, FileType, File
} from 'lucide-react'
import { noteService } from '@/admin/services'
import { PageHeader, Badge, Spinner, Card, CardContent, Button, Input } from '@/admin/components/ui'
import { toast, ToastContainer } from '@/admin/components/Toast'
import { formatDate, cn } from '@/utils'
import { useState } from 'react'

interface NoteItem {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
}

export default function StudentNotesPage() {
    const [search, setSearch] = useState('')

    const { data: notes = [], isLoading } = useQuery<NoteItem[]>({
        queryKey: ['student-notes'],
        queryFn: noteService.getAll
    })

    const handleDownload = async (id: string) => {
        try {
            const url = await noteService.getDownloadUrl(id);
            if (url) {
                window.open(url, '_blank');
            } else {
                toast.error('Download link not available');
            }
        } catch (error) {
            toast.error('Failed to get download link');
        }
    }

    const filteredNotes = notes.filter(n => 
        n.title.toLowerCase().includes(search.toLowerCase()) || 
        n.description?.toLowerCase().includes(search.toLowerCase()) ||
        n.fileName.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Spinner />
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] animate-pulse font-mono">Accessing Note Repository...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ToastContainer />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600">
                        Study Materials
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Access and download supplementary PDFs, guides, and course materials.</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative group max-w-2xl">
                <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-all group-focus-within:text-amber-500 group-focus-within:scale-110" />
                <input
                    type="text"
                    className="w-full bg-card/50 border border-border/60 rounded-[1.5rem] py-4 pl-14 pr-6 text-base focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/40 transition-all placeholder:text-muted-foreground/40 shadow-sm"
                    placeholder="Search by title, description or filename..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {filteredNotes.length === 0 ? (
                <div className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-muted/30 flex items-center justify-center text-muted-foreground/30">
                        <HardDrive size={48} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">No materials found</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">We couldn't find any study materials matching your search. Check back later or try different keywords.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => {
                        const isPdf = note.fileType.includes('pdf');
                        return (
                            <Card key={note.id} className="group rounded-[2rem] overflow-hidden border-border/60 hover:border-amber-500/30 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 bg-card/40 backdrop-blur-sm">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                                            isPdf ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                        )}>
                                            {isPdf ? <FileText size={28} /> : <File size={28} />}
                                        </div>
                                        <Badge variant="outline" className="rounded-full px-3 py-1 bg-muted/40 text-[10px] font-bold uppercase tracking-widest border-border/40">
                                            {note.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                                        </Badge>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <h3 className="text-xl font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-amber-500 transition-colors">
                                            {note.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
                                            {note.description || 'No additional description provided for this material.'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-border/40 space-y-4">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-amber-500/50" />
                                                <span>{formatDate(note.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <HardDrive size={14} className="text-amber-500/50" />
                                                <span>{(note.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleDownload(note.id)}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-12 gap-3 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all font-bold group/btn"
                                        >
                                            <Download size={20} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                                            Download Material
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    )
}
