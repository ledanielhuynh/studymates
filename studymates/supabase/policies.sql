-- Profiles policies
create policy "Profiles are readable by authenticated users" on public.profiles
for select
using (auth.role() = 'authenticated');

create policy "Users can update own profile" on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Insert own profile" on public.profiles
for insert
with check (auth.uid() = id);

-- Groups policies
create policy "Groups readable by authenticated users" on public.groups
for select
using (auth.role() = 'authenticated');

create policy "Create group if owner is self" on public.groups
for insert
with check (owner_id = auth.uid());

create policy "Owner can update group" on public.groups
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Owner can delete group" on public.groups
for delete
using (owner_id = auth.uid());

-- Sessions policies
create policy "Sessions readable by authenticated users" on public.sessions
for select
using (auth.role() = 'authenticated');

create policy "Owner can create sessions" on public.sessions
for insert
with check (exists(select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()));

create policy "Owner can update sessions" on public.sessions
for update
using (exists(select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()))
with check (exists(select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()));

-- Join Requests policies
create policy "Join requests readable to authenticated" on public.join_requests
for select
using (auth.role() = 'authenticated');

create policy "Requester can insert" on public.join_requests
for insert
with check (requester_id = auth.uid());

create policy "Requester can update own" on public.join_requests
for update
using (requester_id = auth.uid())
with check (requester_id = auth.uid());