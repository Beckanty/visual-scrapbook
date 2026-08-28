CREATE POLICY "Users can read their own photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'photos' AND owner = auth.uid());