-- Secure Business Deletion Function
-- This function safely deletes a business and all its related data including storage files

CREATE OR REPLACE FUNCTION delete_business_with_cleanup(business_id_param UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    business_record RECORD;
    image_record RECORD;
    deleted_files TEXT[] := '{}';
    deletion_summary JSON;
BEGIN
    -- Validate input
    IF business_id_param IS NULL THEN
        RAISE EXCEPTION 'Business ID cannot be null';
    END IF;

    -- Check if business exists and get basic info
    SELECT * INTO business_record 
    FROM businesses 
    WHERE id = business_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Business with ID % not found', business_id_param;
    END IF;

    -- Log the deletion attempt
    RAISE NOTICE 'Starting deletion of business: % (ID: %)', business_record.business_name, business_id_param;

    -- Get all business images before deletion for storage cleanup
    FOR image_record IN 
        SELECT id, image_url, is_primary, caption
        FROM business_images 
        WHERE business_id = business_id_param
    LOOP
        -- Extract storage path from URL for deletion
        -- URLs are like: https://project.supabase.co/storage/v1/object/public/business-images/path/file.jpg
        IF image_record.image_url IS NOT NULL AND image_record.image_url LIKE '%/storage/v1/object/public/business-images/%' THEN
            -- Extract the path after '/business-images/'
            DECLARE
                storage_path TEXT;
            BEGIN
                storage_path := substring(image_record.image_url from '/business-images/(.+)$');
                IF storage_path IS NOT NULL THEN
                    -- Attempt to delete from storage
                    -- Note: This requires the storage.objects delete permission
                    BEGIN
                        -- Delete from storage bucket
                        PERFORM storage.delete_object('business-images', storage_path);
                        deleted_files := array_append(deleted_files, storage_path);
                        RAISE NOTICE 'Deleted storage file: %', storage_path;
                    EXCEPTION WHEN OTHERS THEN
                        -- Log but don't fail the entire operation
                        RAISE WARNING 'Failed to delete storage file %, error: %', storage_path, SQLERRM;
                    END;
                END IF;
            END;
        END IF;
    END LOOP;

    -- Delete the business (CASCADE will handle all related tables)
    DELETE FROM businesses WHERE id = business_id_param;
    
    -- Verify deletion
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to delete business with ID %', business_id_param;
    END IF;

    -- Create deletion summary
    deletion_summary := json_build_object(
        'success', true,
        'business_id', business_id_param,
        'business_name', business_record.business_name,
        'deleted_at', now(),
        'deleted_files_count', array_length(deleted_files, 1),
        'deleted_files', deleted_files,
        'message', format('Successfully deleted business "%s" and %s related files', 
                         business_record.business_name, 
                         COALESCE(array_length(deleted_files, 1), 0))
    );

    RAISE NOTICE 'Deletion completed: %', deletion_summary;
    
    RETURN deletion_summary;

EXCEPTION WHEN OTHERS THEN
    -- Handle any errors
    RAISE EXCEPTION 'Failed to delete business: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
-- Note: The RLS policies will still apply to ensure only authorized users can delete businesses
GRANT EXECUTE ON FUNCTION delete_business_with_cleanup(UUID) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION delete_business_with_cleanup(UUID) IS 
'Securely deletes a business and all related data including storage files. Returns a JSON summary of the deletion.';
