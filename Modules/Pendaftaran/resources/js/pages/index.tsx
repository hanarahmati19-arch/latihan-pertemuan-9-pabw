import { Head, useHttp } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    data as registrationsData,
    destroy as destroyRegistration,
    store as storeRegistration,
    update as updateRegistration,
} from '@/routes/pendaftaran';

type Registration = {
    id: number;
    name: string;
    email: string;
    phone: string;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type RegistrationPage = {
    data: Registration[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type RegistrationInput = {
    name: string;
    email: string;
    phone: string;
};

type RegistrationResponse = { data: Registration };

const emptyRegistration: RegistrationInput = {
    name: '',
    email: '',
    phone: '',
};

const emptyPage: RegistrationPage = {
    data: [],
    links: [],
    from: null,
    to: null,
    total: 0,
};

export default function PendaftaranIndex() {
    const [page, setPage] = useState(emptyPage);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const { get, processing: loading } = useHttp<{}, RegistrationPage>({});
    const {
        data,
        setData,
        post,
        put,
        errors,
        processing: saving,
        resetAndClearErrors,
    } = useHttp<RegistrationInput, RegistrationResponse>(emptyRegistration);
    const { delete: deleteRequest, processing: deleting } = useHttp<
        {},
        { message: string }
    >({});

    useEffect(() => {
        void get(registrationsData.url(), {
            onSuccess: setPage,
        }).catch(() => toast.error('Could not load registrations.'));
    }, [get]);

    const reload = () => {
        void get(registrationsData.url(), {
            onSuccess: setPage,
        }).catch(() => toast.error('Could not load registrations.'));
    };

    const openCreateForm = () => {
        resetAndClearErrors();
        setData(emptyRegistration);
        setEditingId(null);
        setFormOpen(true);
    };

    const openEditForm = (registration: Registration) => {
        resetAndClearErrors();
        setData({
            name: registration.name,
            email: registration.email,
            phone: registration.phone,
        });
        setEditingId(registration.id);
        setFormOpen(true);
    };

    const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            onSuccess: () => {
                setFormOpen(false);
                setEditingId(null);
                resetAndClearErrors();
                toast.success(
                    editingId
                        ? 'Registration updated.'
                        : 'Registration created.',
                );
                reload();
            },
            onHttpException: () => {
                toast.error('The request could not be completed.');
            },
            onNetworkError: () => {
                toast.error('Network error. Try again.');
            },
        };

        if (editingId === null) {
            void post(storeRegistration.url(), options);
        } else {
            void put(updateRegistration.url(editingId), options);
        }
    };

    const deleteRecord = (registration: Registration) => {
        if (!window.confirm(`Delete registration for ${registration.name}?`)) {
            return;
        }

        void deleteRequest(destroyRegistration.url(registration.id), {
            onSuccess: () => {
                toast.success('Registration deleted.');
                reload();
            },
            onHttpException: () => {
                toast.error('The request could not be completed.');
            },
            onNetworkError: () => {
                toast.error('Network error. Try again.');
            },
        });
    };

    return (
        <>
            <Head title="Pendaftaran" />
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Pendaftaran"
                        description="Manage registration records"
                    />
                    <Button onClick={openCreateForm}>
                        <Plus />
                        Add registration
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {page.data.map((registration) => (
                                <tr key={registration.id}>
                                    <td className="px-4 py-3 font-medium">
                                        {registration.name}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {registration.email}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {registration.phone}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                aria-label={`Edit ${registration.name}`}
                                                onClick={() =>
                                                    openEditForm(registration)
                                                }
                                                size="icon"
                                                variant="ghost"
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                aria-label={`Delete ${registration.name}`}
                                                disabled={deleting}
                                                onClick={() =>
                                                    deleteRecord(registration)
                                                }
                                                size="icon"
                                                variant="ghost"
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {page.data.length === 0 ? (
                                <tr>
                                    <td
                                        className="px-4 py-10 text-center text-muted-foreground"
                                        colSpan={4}
                                    >
                                        {loading
                                            ? 'Loading registrations...'
                                            : 'No registrations found.'}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        {page.from ?? 0}-{page.to ?? 0} of {page.total}{' '}
                        registrations
                    </p>
                    <nav
                        aria-label="Registration pages"
                        className="flex flex-wrap gap-1"
                    >
                        {page.links.map((link, index) =>
                            link.url ? (
                                <Button
                                    aria-current={
                                        link.active ? 'page' : undefined
                                    }
                                    className={
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : ''
                                    }
                                    key={`${link.label}-${index}`}
                                    onClick={() => {
                                        void get(link.url!, {
                                            onSuccess: setPage,
                                        });
                                    }}
                                    size="sm"
                                    variant="outline"
                                >
                                    {link.label
                                        .replace('&laquo;', '←')
                                        .replace('&raquo;', '→')}
                                </Button>
                            ) : (
                                <Button
                                    aria-disabled="true"
                                    disabled
                                    key={`${link.label}-${index}`}
                                    size="sm"
                                    variant="outline"
                                >
                                    {link.label
                                        .replace('&laquo;', '←')
                                        .replace('&raquo;', '→')}
                                </Button>
                            ),
                        )}
                    </nav>
                </div>
            </div>

            {formOpen ? (
                <div
                    aria-labelledby="registration-form-title"
                    aria-modal="true"
                    className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
                    role="dialog"
                >
                    <section className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <Heading
                                variant="small"
                                title={
                                    editingId
                                        ? 'Edit registration'
                                        : 'New registration'
                                }
                                description="Enter the registrant's contact details"
                            />
                            <Button
                                aria-label="Close form"
                                onClick={() => setFormOpen(false)}
                                size="icon"
                                variant="ghost"
                            >
                                <X />
                            </Button>
                        </div>
                        <form className="grid gap-4" onSubmit={submitForm}>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    autoFocus
                                    id="name"
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    required
                                    value={data.name}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    required
                                    type="email"
                                    value={data.email}
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    onChange={(event) =>
                                        setData('phone', event.target.value)
                                    }
                                    required
                                    type="tel"
                                    value={data.phone}
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    onClick={() => setFormOpen(false)}
                                    type="button"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button disabled={saving} type="submit">
                                    {saving ? 'Saving...' : 'Save registration'}
                                </Button>
                            </div>
                        </form>
                    </section>
                </div>
            ) : null}
        </>
    );
}
