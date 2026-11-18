import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import UserForm from './user-form';

type Props = {
    roles: { value: 'admin' | 'user'; label: string }[];
    user: {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'user';
    };
};

export default function EditUser({ user, roles }: Props) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Edit user"
                    description={user.email}
                />
                <UserForm roles={roles} user={user} />
            </div>
        </>
    );
}
