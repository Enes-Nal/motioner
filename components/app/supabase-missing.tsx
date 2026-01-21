import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SupabaseMissing() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Supabase isn’t configured</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Required environment variables</AlertTitle>
            <AlertDescription>
              Add <code className="rounded bg-muted px-2 py-1">NEXT_PUBLIC_SUPABASE_URL</code>{' '}
              and{' '}
              <code className="rounded bg-muted px-2 py-1">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{' '}
              to <code className="rounded bg-muted px-2 py-1">.env.local</code> (copy from{' '}
              <code className="rounded bg-muted px-2 py-1">env.template</code>).
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
