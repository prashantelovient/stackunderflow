import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import {
    Plus, Pencil, Trash2, FileText, Download, Calendar,
    Layout, Trash, Edit, Eye, UploadCloud, File,
    MoreVertical, Search, FileType, HardDrive
} from 'lucide-react'
import { noteService, storageService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import { PageHeader, Badge, Spinner, Card, CardContent, Button, Input, Textarea } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Toast'
import { formatDate, cn } from '@/utils'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/admin/components/dropdown-menu"

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

const emptyForm = { title: '', description: '' }

export default function InstructorNotesPage() {
    const qc = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [editItem, setEditItem] = useState<NoteItem | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const { data: notes = [], isLoading } = useQuery<NoteItem[]>({
        queryKey: ['instructor-notes'],
        queryFn: noteService.getAll
    })

    const openNew = () => {
        setEditItem(null);
        setForm(emptyForm);
        setSelectedFile(null);
        setModalOpen(true);
    }

    const openEdit = (n: NoteItem) => {
        setEditItem(n);
        setForm({ title: n.title, description: n.description });
        setSelectedFile(null);
        setModalOpen(true);
    }

    const handleUpload = async () => {
        if (!selectedFile && !editItem) {
            toast.error('Please select a file to upload');
            return;
        }

        setUploading(true);
        try {
            let fileData = editItem ? {
                fileUrl: editItem.fileUrl,
                fileName: editItem.fileName,
                fileType: editItem.fileType,
                fileSize: editItem.fileSize
            } : null;

            if (selectedFile) {
                // 1. Get presigned URL
                const { url, key } = await storageService.getPresignedUrl(
                    selectedFile.name,
                    selectedFile.type,
                    'notes'
                );

                // 2. Upload to MinIO
                await storageService.uploadFileToS3(url, selectedFile);

                fileData = {
                    fileUrl: key,
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    fileSize: selectedFile.size
                };
            }

            const payload = {
                ...form,
                ...fileData
            };

            if (editItem) {
                await noteService.update(editItem.id, payload);
                toast.success('Note updated successfully');
            } else {
                await noteService.create(payload);
                toast.success('Note uploaded successfully');
            }

            qc.invalidateQueries({ queryKey: ['instructor-notes'] });
            setModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to process note upload');
        } finally {
            setUploading(false);
        }
    }

    const deleteMutation = useMutation({
        mutationFn: (id: string) => noteService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['instructor-notes'] });
            toast.success('Note deleted successfully');
            setDeleteId(null)
        },
    })

    const handleDownload = async (id: string) => {
        try {
            const url = await noteService.getDownloadUrl(id);
            window.open(url, '_blank');
        } catch (error) {
            toast.error('Failed to get download link');
        }
    }

    const columns = useMemo<ColumnDef<NoteItem, unknown>[]>(() => [
        {
            id: 'icon', header: 'Type',
            cell: ({ row }) => {
                const type = row.original.fileType;
                const isPdf = type.includes('pdf');
                return (
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                        isPdf ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    )}>
                        {isPdf ? <FileText className="w-5 h-5" /> : <File className="w-5 h-5" />}
                    </div>
                )
            }
        },
        {
            accessorKey: 'title',
            header: 'Note Title',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground text-sm tracking-tight">{row.original.title}</span>
                    <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-widest pt-0.5 line-clamp-1 max-w-[250px]">{row.original.description || 'No description'}</span>
                </div>
            )
        },
        {
            accessorKey: 'fileName',
            header: 'File Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <HardDrive className="w-3.5 h-3.5 opacity-50" />
                    <span className="truncate max-w-[150px]">{row.original.fileName}</span>
                </div>
            )
        },
        {
            accessorKey: 'fileSize',
            header: 'Size',
            cell: ({ row }) => (
                <span className="text-[10px] font-mono font-bold text-muted-foreground/80">
                    {(row.original.fileSize / (1024 * 1024)).toFixed(2)} MB
                </span>
            )
        },
        {
            accessorKey: 'createdAt',
            header: 'Registry Date',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(row.original.createdAt)}
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Management',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="h-9 w-9 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground flex items-center justify-center outline-none"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-xl border-border bg-card text-foreground shadow-2xl z-50"
                    >
                        <DropdownMenuItem
                            onClick={() => handleDownload(row.original.id)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => openEdit(row.original)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => setDeleteId(row.original.id)}
                            className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400 hover:bg-red-500/10"
                        >
                            <Trash className="w-4 h-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [])

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Spinner />
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] animate-pulse font-mono">Accessing Note Repository...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <ToastContainer />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Note Repository</h1>
                    <p className="text-muted-foreground mt-1">Manage supplementary materials like PDFs, documents, and slides.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={openNew}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all h-12 px-6 font-bold"
                    >
                        <UploadCloud className="w-5 h-5" />
                        Upload Note
                    </Button>
                </div>
            </div>

            <Card className="rounded-[2rem] overflow-hidden border-border/80 shadow-xl bg-card/40 backdrop-blur-sm">
                <CardContent className="p-0">
                    <DataTable
                        data={notes}
                        columns={columns}
                        searchPlaceholder="Search notes by identifier..."
                        searchKey="title"
                    />
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal isOpen={modalOpen} title={editItem ? 'Configuration: Update Note' : 'Registry: New Material Uplink'} onClose={() => setModalOpen(false)} size="md">
                <div className="space-y-6 pt-4">
                    <Input label="Note Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter material title..." />
                    <Textarea label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the material..." />

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">File Upload (PDF, DOCX, etc.)</label>
                        <div className="p-8 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-3 bg-muted/20">
                            <FileType className="w-10 h-10 text-muted-foreground/40" />
                            <label className="cursor-pointer">
                                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) setSelectedFile(file)
                                }} className="hidden" />
                                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95">Select File</span>
                            </label>
                            {selectedFile ? (
                                <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase mt-2 text-center">Ready: {selectedFile.name}<br />({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                            ) : editItem ? (
                                <p className="text-[10px] font-medium text-emerald-500/70 uppercase tracking-widest">Current: {editItem.fileName}</p>
                            ) : (
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">No file linked.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                        <Button variant="ghost" onClick={() => setModalOpen(false)} className="rounded-xl px-6 font-bold text-xs text-muted-foreground hover:text-foreground">DISCARD</Button>
                        <Button loading={uploading} onClick={handleUpload} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 font-bold text-xs uppercase tracking-widest h-11">
                            {editItem ? 'UPDATE CONFIG' : 'UPLOAD MATERIAL'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="DANGER: DESTRUCTIVE PURGE"
                message="This operation will permanently erase the file and metadata. Recovery is not possible within current protocols."
                confirmLabel="EXECUTE PURGE"
                variant="danger"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId!)}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    )
}
