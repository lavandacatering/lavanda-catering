'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function TestUIPage() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 p-8 md:p-16 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Lavanda Design System Showcase
            </h1>
            <p className="text-muted-foreground mt-1">
              Verifikasi visual untuk integrasi shadcn/ui + Tailwind v4 + Base UI
            </p>
          </div>
          <Button onClick={toggleTheme} variant="outline" size="sm">
            Mode {theme === 'light' ? 'Gelap 🌙' : 'Terang ☀️'}
          </Button>
        </header>

        {/* Section 1: Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-l-4 border-primary pl-3">Buttons (Tombol)</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="default">Primary Brand</Button>
            <Button variant="secondary">Secondary Brand</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link Style</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="default" size="xs">
              Extra Small
            </Button>
            <Button variant="default" size="sm">
              Small
            </Button>
            <Button variant="default" size="default">
              Default Size
            </Button>
            <Button variant="default" size="lg">
              Large Size
            </Button>
          </div>
        </section>

        {/* Section 2: Form & Dialog */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-l-4 border-primary pl-3">
              Inputs & Labels
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Formulir Pemesanan</CardTitle>
                <CardDescription>
                  Gaya input teks dan label premium yang terstandardisasi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nama Pemesan</Label>
                  <Input id="name" placeholder="Masukkan nama lengkap Anda" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Nomor WhatsApp</Label>
                  <Input id="phone" type="tel" placeholder="Contoh: 081234567890" />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="outline" size="sm">
                  Batal
                </Button>
                <Button size="sm">Simpan</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-l-4 border-primary pl-3">
              Interactive Dialog (Modal)
            </h2>
            <Card className="h-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Dialog Interaktif</CardTitle>
                <CardDescription>
                  Komponen modal beraksesibilitas penuh (Radix / Base UI).
                </CardDescription>
              </CardHeader>
              <CardContent className="grow flex items-center justify-center py-8">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline">Buka Modal Dialog</Button>} />
                  <DialogContent className="max-w-md bg-card p-6 rounded-xl border border-border shadow-modal animate-slide-up">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold text-primary">
                        Ubah Status Pesanan
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground mt-1">
                        Pesanan LVC-20260521-001 akan diubah menjadi status &quot;Lunas&quot;.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="my-6 p-4 rounded-lg bg-muted text-xs space-y-2 border border-border">
                      <p className="font-semibold">Pesan WA Otomatis yang Akan Dikirim:</p>
                      <p className="italic text-muted-foreground">
                        &quot;Halo Bpk/Ibu, pembayaran DP untuk pesanan LVC-20260521-001 sebesar Rp
                        2.500.000 telah kami terima. Terima kasih!&quot;
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <DialogTrigger
                        render={
                          <Button variant="outline" size="sm">
                            Batal
                          </Button>
                        }
                      />
                      <Button size="sm">Kirim & Simpan</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Tables */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-l-4 border-primary pl-3">
            Table (Tabel Pesanan)
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pesanan Terkini</CardTitle>
              <CardDescription>
                Tabel performa tinggi dengan border styling yang bersih dan responsif.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">No. Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-medium">LVC-20260521-001</TableCell>
                    <TableCell>Budi Santoso</TableCell>
                    <TableCell>21 Mei 2026</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Dikonfirmasi
                      </span>
                    </TableCell>
                    <TableCell className="text-right">Rp 3.500.000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-medium">LVC-20260521-002</TableCell>
                    <TableCell>Siti Rahma</TableCell>
                    <TableCell>21 Mei 2026</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600">
                        Pending
                      </span>
                    </TableCell>
                    <TableCell className="text-right">Rp 1.250.000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-medium">LVC-20260521-003</TableCell>
                    <TableCell>Ahmad Fauzi</TableCell>
                    <TableCell>20 Mei 2026</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                        Selesai
                      </span>
                    </TableCell>
                    <TableCell className="text-right">Rp 5.750.000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
