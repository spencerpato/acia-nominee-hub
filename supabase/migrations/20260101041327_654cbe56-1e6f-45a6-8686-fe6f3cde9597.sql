-- Create policy for admins to upload gallery images
CREATE POLICY "Admins can upload gallery images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = 'gallery'
  AND (
    public.has_role(auth.uid(), 'superadmin'::app_role) 
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Create policy for admins to update gallery images
CREATE POLICY "Admins can update gallery images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = 'gallery'
  AND (
    public.has_role(auth.uid(), 'superadmin'::app_role) 
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Create policy for admins to delete gallery images
CREATE POLICY "Admins can delete gallery images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = 'gallery'
  AND (
    public.has_role(auth.uid(), 'superadmin'::app_role) 
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);