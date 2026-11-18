import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { destroy, edit, create } from '@/routes/usermanagement';

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    roleLabel: string;
    createdAt: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    users: {
        data: ManagedUser[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    currentUserId: number;
};

export default function UserManagementIndex({ users, currentUserId }: Props) {
    return (
        <>
            <Head title="User management" />
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="User management"
                        description="Manage accounts and access roles"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus />
                            Add user
                        </Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-3 font-medium">
                                        {user.name}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                user.role === 'admin'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {user.roleLabel}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                asChild
                                                aria-label={`Edit ${user.name}`}
                                                size="icon"
                                                variant="ghost"
                                            >
                                                <Link href={edit(user.id)}>
                                                    <Pencil />
                                                </Link>
                                            </Button>
                                            {user.id !== currentUserId ? (
                                                <Button
                                                    aria-label={`Delete ${user.name}`}
                                                    onClick={() =>
                                                        router.delete(
                                                            destroy(user.id),
                                                            {
                                                                preserveScroll: true,
                                                                onBefore: () =>
                                                                    window.confirm(
                                                                        `Delete ${user.name}?`,
                                                                    ),
                                                            },
                                                        )
                                                    }
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Trash2 />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 ? (
                                <tr>
                                    <td
                                        className="px-4 py-10 text-center text-muted-foreground"
                                        colSpan={4}
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        {users.from ?? 0}-{users.to ?? 0} of {users.total} users
                    </p>
                    <nav
                        aria-label="User pages"
                        className="flex flex-wrap gap-1"
                    >
                        {users.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    aria-current={
                                        link.active ? 'page' : undefined
                                    }
                                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    href={link.url}
                                    key={`${link.label}-${index}`}
                                    preserveScroll
                                >
                                    {link.label
                                        .replace('&laquo;', '←')
                                        .replace('&raquo;', '→')}
                                </Link>
                            ) : (
                                <span
                                    aria-disabled="true"
                                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm text-muted-foreground opacity-50"
                                    key={`${link.label}-${index}`}
                                >
                                    {link.label
                                        .replace('&laquo;', '←')
                                        .replace('&raquo;', '→')}
                                </span>
                            ),
                        )}
                    </nav>
                </div>
            </div>
        </>
    );
}
