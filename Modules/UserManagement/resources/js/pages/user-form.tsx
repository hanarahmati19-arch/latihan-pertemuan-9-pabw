import { Form, Link } from '@inertiajs/react';
import { index, store, update } from '@/routes/usermanagement';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UserRoleOption = {
    value: 'admin' | 'user';
    label: string;
};

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
};

type Props = {
    roles: UserRoleOption[];
    user?: ManagedUser;
};

export default function UserForm({ roles, user }: Props) {
    const action = user ? update.form(user.id) : store.form();

    return (
        <Form
            {...action}
            className="grid max-w-2xl gap-5"
            options={{ preserveScroll: true }}
        >
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            autoComplete="name"
                            defaultValue={user?.name}
                            id="name"
                            name="name"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            autoComplete="email"
                            defaultValue={user?.email}
                            id="email"
                            name="email"
                            required
                            type="email"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            defaultValue={user?.role ?? 'user'}
                            id="role"
                            name="role"
                            required
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.role} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            Password
                            {user ? ' (leave blank to keep current)' : ''}
                        </Label>
                        <Input
                            autoComplete="new-password"
                            id="password"
                            name="password"
                            required={!user}
                            type="password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <Input
                            autoComplete="new-password"
                            id="password_confirmation"
                            name="password_confirmation"
                            required={!user}
                            type="password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex gap-2">
                        <Button disabled={processing} type="submit">
                            {processing
                                ? 'Saving...'
                                : user
                                  ? 'Save changes'
                                  : 'Create user'}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={index()}>Cancel</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
