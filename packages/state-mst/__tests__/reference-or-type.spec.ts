import { types, getSnapshot, unprotect } from 'mobx-state-tree';
import { ReferenceOrType } from '../src/types/mst/reference-or-type';

describe('ReferenceOrType type', () => {

    it('Should accept both reference and model', () => {

        let User = types.model('User', {
            id: types.identifier,
            name: types.string
        });

        let UserProfile = types.model('UserProfile', {
            user: ReferenceOrType(User),
            email: types.string
        });

        let UserPage = types.model('UserPage', {
            userProfile: UserProfile,
            user: types.maybe(User)
        });

        let withReference = UserPage.create({
            user: User.create({
                id: '1',
                name: 'Sid'
            }),
            userProfile: UserProfile.create({
                user: '1',
                email: 'sid@vicious.com'
            })
        });

        let withType = UserPage.create({
            userProfile: {
                user: User.create({
                    id: '1',
                    name: 'Sid'
                }),
                email: 'sid@vicious.com'
            }
        });

        expect(withReference.userProfile.user.name).toBe('Sid');
        expect(getSnapshot(withReference.userProfile).user).toBe('1');

        expect(withType.userProfile.user.name).toBe('Sid');
        expect(getSnapshot(withType.userProfile).user).toStrictEqual({id: '1', name: 'Sid'});
    });

    it('Should accept node instances already in tree as reference', () => {
        let User = types.model('User', {
            id: types.identifier,
            name: types.string
        });

        let UserProfile = types.model('UserProfile', {
            user: ReferenceOrType(User),
            email: types.string
        });

        let UserPage = types.model('UserPage', {
            userProfile: types.maybe(UserProfile),
            user: types.maybe(User)
        });

        let user = User.create({
            id: '1',
            name: 'Sid'
        });

        let withReference = UserPage.create({
            user: user
        });

        unprotect(withReference);

        withReference.userProfile = UserProfile.create({
            user: user,
            email: 'sid@vicious.com'
        });

        expect(withReference.userProfile.user.name).toBe('Sid');
        expect(getSnapshot(withReference.userProfile)!.user).toBe('1');
    });

    it('Should work with safeReference type', () => {
        let User = types.model('User', {
            id: types.identifier,
            name: types.string
        });

        let UserList = types.model({
            items: types.array(User),
            selected: ReferenceOrType(User, types.safeReference(User, {acceptsUndefined: true}))
        });

        let testUsers = [User.create({id: '1', name: 'User1'}), User.create({id: '2', name: 'User2'})];

        let userList = UserList.create({
            items: testUsers,
            selected: '1'
        });

        unprotect(userList);

        expect(userList.selected!.name).toBe('User1');

        userList.items.splice(0, 1);

        expect(userList.selected).toBeUndefined();

    });

});
