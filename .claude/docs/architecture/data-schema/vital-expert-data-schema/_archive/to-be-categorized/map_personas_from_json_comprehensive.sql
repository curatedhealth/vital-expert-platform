-- =====================================================================
-- MAP PERSONAS TO ROLES, FUNCTIONS, AND DEPARTMENTS
-- Generated from PERSONAS_ROW_FULLY_MAPPED.json
-- Total personas to map: 697
-- =====================================================================

BEGIN;

DO $$
DECLARE
    persona_record RECORD;
    personas_updated INTEGER := 0;
    update_count INTEGER;
    personas_with_role INTEGER := 0;
    personas_with_function INTEGER := 0;
    personas_with_department INTEGER := 0;
    personas_fully_mapped INTEGER := 0;
BEGIN
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '🔄 MAPPING PERSONAS TO ROLES, FUNCTIONS, AND DEPARTMENTS';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';

    -- Processing 691 fully mapped personas (role + function + department)
    -- Processing 6 partially mapped personas

    -- Persona: Dr. Marco Bellini
    -- ID: 0001137b-7026-4d0b-ae1d-27c752e769eb
    UPDATE public.personas
    SET
        role_id = '1cd1953d-301e-4ad7-995c-6137fa319ada'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid,
        updated_at = NOW()
    WHERE id = '0001137b-7026-4d0b-ae1d-27c752e769eb'::uuid
      AND (role_id IS DISTINCT FROM '1cd1953d-301e-4ad7-995c-6137fa319ada'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Rodriguez
    -- ID: 0057bbcc-f981-4942-8eb8-2c2555331c8d
    UPDATE public.personas
    SET
        role_id = '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid,
        updated_at = NOW()
    WHERE id = '0057bbcc-f981-4942-8eb8-2c2555331c8d'::uuid
      AND (role_id IS DISTINCT FROM '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda Foster
    -- ID: 00b6ab6c-6064-4c3e-9e9a-c4f38374f24f
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '00b6ab6c-6064-4c3e-9e9a-c4f38374f24f'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Garcia
    -- ID: 013901be-e2b2-4a65-8fba-b3670c12a00c
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '013901be-e2b2-4a65-8fba-b3670c12a00c'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Elizabeth Martin
    -- ID: 02189e56-fbe3-4ec4-8e18-d198d3a17cf6
    UPDATE public.personas
    SET
        role_id = 'bbbbd1ec-666d-4710-9049-a3669109464d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'b02f8883-25b4-4582-8c95-ccc46aa1bd7a'::uuid,
        updated_at = NOW()
    WHERE id = '02189e56-fbe3-4ec4-8e18-d198d3a17cf6'::uuid
      AND (role_id IS DISTINCT FROM 'bbbbd1ec-666d-4710-9049-a3669109464d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'b02f8883-25b4-4582-8c95-ccc46aa1bd7a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Mark Anderson
    -- ID: 027ff91a-41a7-4452-a680-7c34fdc3809c
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '027ff91a-41a7-4452-a680-7c34fdc3809c'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Garcia
    -- ID: 02faf3de-7f7a-4f57-a09f-e0a8d16f7fb2
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '02faf3de-7f7a-4f57-a09f-e0a8d16f7fb2'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Andrew Lewis
    -- ID: 0362fc1c-f0e1-4578-b297-a744d6427e8b
    UPDATE public.personas
    SET
        role_id = 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '0362fc1c-f0e1-4578-b297-a744d6427e8b'::uuid
      AND (role_id IS DISTINCT FROM 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Davis
    -- ID: 04c0be90-c976-453f-99dd-a5c040600d99
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '04c0be90-c976-453f-99dd-a5c040600d99'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Wilson
    -- ID: 05f8072c-ff13-4a0a-92cc-f7d39f509483
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '05f8072c-ff13-4a0a-92cc-f7d39f509483'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Davis
    -- ID: 062d6997-cf68-4161-a30a-9b162f726856
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '062d6997-cf68-4161-a30a-9b162f726856'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Thompson
    -- ID: 067eeec3-2d80-4835-a1bb-4c0226728d8a
    UPDATE public.personas
    SET
        role_id = '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '067eeec3-2d80-4835-a1bb-4c0226728d8a'::uuid
      AND (role_id IS DISTINCT FROM '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Bennett
    -- ID: 068768fc-a4c3-4b7e-b209-a7f3fd85c81d
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '068768fc-a4c3-4b7e-b209-a7f3fd85c81d'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Garcia
    -- ID: 06d0774c-b5c6-44ad-9a42-276c2fc66bb5
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '06d0774c-b5c6-44ad-9a42-276c2fc66bb5'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Thompson
    -- ID: 06e7e1c5-7dbe-42ea-b642-c898f45ff448
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '06e7e1c5-7dbe-42ea-b642-c898f45ff448'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elizabeth Thompson
    -- ID: 07694d12-eb2b-4ef4-aab5-ee0447b0ea19
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '07694d12-eb2b-4ef4-aab5-ee0447b0ea19'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Hill
    -- ID: 077e36d3-7b3e-4959-a09c-a3ac50537593
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '077e36d3-7b3e-4959-a09c-a3ac50537593'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elena Kovalenko
    -- ID: 0811dc30-3901-4efb-abaf-6e681f6d92c1
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = '0811dc30-3901-4efb-abaf-6e681f6d92c1'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Rachel Cohen
    -- ID: 092178b8-8033-4bac-8284-140807dbb8a1
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '092178b8-8033-4bac-8284-140807dbb8a1'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elizabeth Rodriguez
    -- ID: 0970b947-088f-4f03-82d7-26630a810d32
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '0970b947-088f-4f03-82d7-26630a810d32'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Davis
    -- ID: 0a7bfe3e-0d89-4139-a0ae-6b949b564b74
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '0a7bfe3e-0d89-4139-a0ae-6b949b564b74'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Thomas Brown
    -- ID: 0acaf72b-5a7a-4326-9c08-4ff8185221f6
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '0acaf72b-5a7a-4326-9c08-4ff8185221f6'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Alexandra Thompson
    -- ID: 0aff07e5-4fd1-4912-88f5-79d4dd4f813c
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '0aff07e5-4fd1-4912-88f5-79d4dd4f813c'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Anderson
    -- ID: 0b1ef6b7-d2d9-4f4e-8cac-d0a8d1de81c6
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '0b1ef6b7-d2d9-4f4e-8cac-d0a8d1de81c6'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Richard Santos
    -- ID: 0b292792-377c-4514-9774-3a6b79ee5056
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '0b292792-377c-4514-9774-3a6b79ee5056'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Thomas Clarke
    -- ID: 0b302b82-c951-470c-acf4-adc649df676c
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '0b302b82-c951-470c-acf4-adc649df676c'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lauren Moore
    -- ID: 0b445821-d5b8-4093-9817-5ab60d63c39a
    UPDATE public.personas
    SET
        role_id = '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid,
        updated_at = NOW()
    WHERE id = '0b445821-d5b8-4093-9817-5ab60d63c39a'::uuid
      AND (role_id IS DISTINCT FROM '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Wilson
    -- ID: 0b4e8923-c4ff-41c6-a671-bb3302a8f176
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '0b4e8923-c4ff-41c6-a671-bb3302a8f176'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Victoria Thompson
    -- ID: 0ba3ffd4-8929-4913-ac71-fc72697f7b46
    UPDATE public.personas
    SET
        role_id = '92417d4c-59ed-4800-bebe-d0149d18bf05'::uuid,
        function_id = '1ff28cf9-17b8-451b-89b1-999048b6542d'::uuid,
        department_id = '0052e6e5-d15c-415c-91fe-6dc6a373a37b'::uuid,
        updated_at = NOW()
    WHERE id = '0ba3ffd4-8929-4913-ac71-fc72697f7b46'::uuid
      AND (role_id IS DISTINCT FROM '92417d4c-59ed-4800-bebe-d0149d18bf05'::uuid
           OR function_id IS DISTINCT FROM '1ff28cf9-17b8-451b-89b1-999048b6542d'::uuid
           OR department_id IS DISTINCT FROM '0052e6e5-d15c-415c-91fe-6dc6a373a37b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lisa Martinez
    -- ID: 0bc12835-98a7-4e98-beee-8fba874d7de4
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '0bc12835-98a7-4e98-beee-8fba874d7de4'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Thomas Clarke
    -- ID: 0c8d3367-9f9b-473a-89cd-94c7164b7706
    UPDATE public.personas
    SET
        role_id = '2127d5cf-f94c-4456-a0c7-015c502e27bc'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid,
        updated_at = NOW()
    WHERE id = '0c8d3367-9f9b-473a-89cd-94c7164b7706'::uuid
      AND (role_id IS DISTINCT FROM '2127d5cf-f94c-4456-a0c7-015c502e27bc'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Priya Singh
    -- ID: 0c91dc71-e091-49e3-90b4-eab5ff18bdf2
    UPDATE public.personas
    SET
        role_id = '92417d4c-59ed-4800-bebe-d0149d18bf05'::uuid,
        function_id = '1ff28cf9-17b8-451b-89b1-999048b6542d'::uuid,
        department_id = '0052e6e5-d15c-415c-91fe-6dc6a373a37b'::uuid,
        updated_at = NOW()
    WHERE id = '0c91dc71-e091-49e3-90b4-eab5ff18bdf2'::uuid
      AND (role_id IS DISTINCT FROM '92417d4c-59ed-4800-bebe-d0149d18bf05'::uuid
           OR function_id IS DISTINCT FROM '1ff28cf9-17b8-451b-89b1-999048b6542d'::uuid
           OR department_id IS DISTINCT FROM '0052e6e5-d15c-415c-91fe-6dc6a373a37b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Mitchell
    -- ID: 0c92c062-d0f2-4c73-ae96-83a97f2ea810
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '0c92c062-d0f2-4c73-ae96-83a97f2ea810'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Wilson
    -- ID: 0d4ebb49-2306-4657-b4ec-745c1008d8a6
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '0d4ebb49-2306-4657-b4ec-745c1008d8a6'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Steven Bennett
    -- ID: 0d5225e2-532e-44fc-afa9-6b3f6b8ba8a2
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '0d5225e2-532e-44fc-afa9-6b3f6b8ba8a2'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Smith
    -- ID: 0da2dec8-530c-4f4f-b997-c291668cac0d
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '0da2dec8-530c-4f4f-b997-c291668cac0d'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Walker
    -- ID: 0db79150-844d-4512-8928-cabb3c78e460
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '0db79150-844d-4512-8928-cabb3c78e460'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Walker
    -- ID: 0ddc0d13-5e25-4bf5-afe0-49f983edbd8b
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '0ddc0d13-5e25-4bf5-afe0-49f983edbd8b'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Clark
    -- ID: 0e80921d-be9f-45d2-940c-0fb3e3e3cca7
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '0e80921d-be9f-45d2-940c-0fb3e3e3cca7'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Rodriguez
    -- ID: 0f51ead3-7dae-4ca4-a5b7-588ad943b9a0
    UPDATE public.personas
    SET
        role_id = '7ac3598c-e21d-4aca-9db7-f152f6d99faf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '0f51ead3-7dae-4ca4-a5b7-588ad943b9a0'::uuid
      AND (role_id IS DISTINCT FROM '7ac3598c-e21d-4aca-9db7-f152f6d99faf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Chen
    -- ID: 0f598c48-516c-4002-80bc-f0a2ec0b7e8f
    UPDATE public.personas
    SET
        role_id = 'c6f91d15-8a63-4140-928b-bd82b39dd33d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = '0f598c48-516c-4002-80bc-f0a2ec0b7e8f'::uuid
      AND (role_id IS DISTINCT FROM 'c6f91d15-8a63-4140-928b-bd82b39dd33d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Nicole Lopez
    -- ID: 0f8ce2a9-237d-4e3f-864e-399b19f1b7e1
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '0f8ce2a9-237d-4e3f-864e-399b19f1b7e1'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Harris
    -- ID: 0faed271-d206-47f3-97db-ccdae82e38cb
    UPDATE public.personas
    SET
        role_id = 'df1a13c8-dfe3-4ace-bf78-0f9a9ac63462'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid,
        updated_at = NOW()
    WHERE id = '0faed271-d206-47f3-97db-ccdae82e38cb'::uuid
      AND (role_id IS DISTINCT FROM 'df1a13c8-dfe3-4ace-bf78-0f9a9ac63462'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia White
    -- ID: 0fc7101b-577c-46d4-90d8-7195b615698b
    UPDATE public.personas
    SET
        role_id = '8716392f-cd29-4ada-b38d-e9f864108b55'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '84674c58-2cd7-4f71-8bde-232539a1e451'::uuid,
        updated_at = NOW()
    WHERE id = '0fc7101b-577c-46d4-90d8-7195b615698b'::uuid
      AND (role_id IS DISTINCT FROM '8716392f-cd29-4ada-b38d-e9f864108b55'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '84674c58-2cd7-4f71-8bde-232539a1e451'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Thompson
    -- ID: 0fd6d3df-e220-4f00-997e-99d9529f1054
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '0fd6d3df-e220-4f00-997e-99d9529f1054'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Davis
    -- ID: 10a6d831-aa20-4645-a7b2-c313e0a1eadf
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '10a6d831-aa20-4645-a7b2-c313e0a1eadf'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Rodriguez
    -- ID: 10bfc81e-1c7f-4c89-89f0-fd222b17e460
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '10bfc81e-1c7f-4c89-89f0-fd222b17e460'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Daniel Wilson
    -- ID: 1182c1f3-0594-4000-8180-414fb854b933
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '1182c1f3-0594-4000-8180-414fb854b933'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Thompson
    -- ID: 12159062-6953-4692-90f2-4730c4216e0e
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '12159062-6953-4692-90f2-4730c4216e0e'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Johnson
    -- ID: 12e296af-fae7-4bd7-82d4-73ae0866451e
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '12e296af-fae7-4bd7-82d4-73ae0866451e'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Samantha Rodriguez
    -- ID: 12f23dcb-d934-4668-8f2a-ee2a70c83c2e
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '12f23dcb-d934-4668-8f2a-ee2a70c83c2e'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Martinez
    -- ID: 13c142b2-934c-4eb7-92f8-0ce08123b4ca
    UPDATE public.personas
    SET
        role_id = 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '13c142b2-934c-4eb7-92f8-0ce08123b4ca'::uuid
      AND (role_id IS DISTINCT FROM 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Lee
    -- ID: 1451a5f6-2743-48cf-a314-b8522345d898
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '1451a5f6-2743-48cf-a314-b8522345d898'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Anderson
    -- ID: 14541eb6-0a3a-408d-b004-2d49e72c29cb
    UPDATE public.personas
    SET
        role_id = 'f63b42bd-5ffd-4071-b159-90149f76a22d'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '14541eb6-0a3a-408d-b004-2d49e72c29cb'::uuid
      AND (role_id IS DISTINCT FROM 'f63b42bd-5ffd-4071-b159-90149f76a22d'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Wilson
    -- ID: 146b0726-bd4a-42db-bdb0-4491d71d2748
    UPDATE public.personas
    SET
        role_id = 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '146b0726-bd4a-42db-bdb0-4491d71d2748'::uuid
      AND (role_id IS DISTINCT FROM 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rebecca Lewis
    -- ID: 148ec306-dfac-4a3c-a3d0-f074714cf0e9
    UPDATE public.personas
    SET
        role_id = 'bbbbd1ec-666d-4710-9049-a3669109464d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'b02f8883-25b4-4582-8c95-ccc46aa1bd7a'::uuid,
        updated_at = NOW()
    WHERE id = '148ec306-dfac-4a3c-a3d0-f074714cf0e9'::uuid
      AND (role_id IS DISTINCT FROM 'bbbbd1ec-666d-4710-9049-a3669109464d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'b02f8883-25b4-4582-8c95-ccc46aa1bd7a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jessica Martinez
    -- ID: 14b0cb89-484b-4307-862f-53af5886e6d1
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '14b0cb89-484b-4307-862f-53af5886e6d1'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Richard Brown
    -- ID: 1630c7a4-209c-407e-a6a7-268bba64e927
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '1630c7a4-209c-407e-a6a7-268bba64e927'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Catherine Lefevre
    -- ID: 1728b0d8-0eaf-43e4-be9c-cb8366e3039f
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '1728b0d8-0eaf-43e4-be9c-cb8366e3039f'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kimberly Jackson
    -- ID: 17849084-3ecf-4dd8-b668-e94f1859ff81
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '17849084-3ecf-4dd8-b668-e94f1859ff81'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lisa Taylor
    -- ID: 179fb5bc-1edd-4f53-9239-d1dc5dd13d53
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '179fb5bc-1edd-4f53-9239-d1dc5dd13d53'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Anderson
    -- ID: 18018b21-8f42-4afb-ac5d-85cb7904d2f7
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '18018b21-8f42-4afb-ac5d-85cb7904d2f7'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Nina Patel
    -- ID: 1804517b-b8cb-4d9b-a5f4-7012d3954846
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '1804517b-b8cb-4d9b-a5f4-7012d3954846'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Andrew Harris
    -- ID: 181f4bcf-c5f1-4e96-b01c-14a12d8f0ff8
    UPDATE public.personas
    SET
        role_id = '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid,
        updated_at = NOW()
    WHERE id = '181f4bcf-c5f1-4e96-b01c-14a12d8f0ff8'::uuid
      AND (role_id IS DISTINCT FROM '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Rodriguez
    -- ID: 186e54ed-cf8b-4a34-bbdc-752670e7abf2
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '186e54ed-cf8b-4a34-bbdc-752670e7abf2'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Lopez
    -- ID: 189ce499-8719-4ccc-a206-fe4acc3368a6
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '189ce499-8719-4ccc-a206-fe4acc3368a6'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Lee
    -- ID: 189efc92-e561-42ea-af09-6a4ff994e6e5
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '189efc92-e561-42ea-af09-6a4ff994e6e5'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Johnson
    -- ID: 192f5ec2-7ff8-4326-88f8-b57f788aed03
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '192f5ec2-7ff8-4326-88f8-b57f788aed03'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Catherine Lefevre
    -- ID: 195e0faf-fe04-43f1-a89d-cbb85d76892c
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '195e0faf-fe04-43f1-a89d-cbb85d76892c'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Daniel White
    -- ID: 196a7ac5-89ed-4142-ae91-d7bcb4d05096
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '196a7ac5-89ed-4142-ae91-d7bcb4d05096'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Mark Jackson
    -- ID: 1a5fca76-249d-4ab2-a550-8777fa811284
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '1a5fca76-249d-4ab2-a550-8777fa811284'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Wright
    -- ID: 1b5766d1-e2e5-4639-9f6c-a5ef612792a5
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '1b5766d1-e2e5-4639-9f6c-a5ef612792a5'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James King
    -- ID: 1b5c8dea-d9c6-4464-85e3-d918b32125f4
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = '1b5c8dea-d9c6-4464-85e3-d918b32125f4'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Young
    -- ID: 1b86224f-a548-458f-818d-8eda7aa622d1
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '1b86224f-a548-458f-818d-8eda7aa622d1'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Maria Gonzalez
    -- ID: 1bbbe226-46f6-475b-ab3e-e447987ea268
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '1bbbe226-46f6-475b-ab3e-e447987ea268'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Moore
    -- ID: 1bce1cce-5563-4d19-810f-da7c7183bef2
    UPDATE public.personas
    SET
        role_id = 'f63b42bd-5ffd-4071-b159-90149f76a22d'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '1bce1cce-5563-4d19-810f-da7c7183bef2'::uuid
      AND (role_id IS DISTINCT FROM 'f63b42bd-5ffd-4071-b159-90149f76a22d'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Rodriguez
    -- ID: 1c6e15fd-e920-4bc5-a576-6889bf3ad321
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '1c6e15fd-e920-4bc5-a576-6889bf3ad321'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Garcia
    -- ID: 1ca840e6-13a7-4ab9-bc66-7268b25376ac
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '1ca840e6-13a7-4ab9-bc66-7268b25376ac'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elena Volkov
    -- ID: 1ce9964d-27c2-411f-86fb-f90530df0c41
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '1ce9964d-27c2-411f-86fb-f90530df0c41'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michelle Davis
    -- ID: 1cf45915-f111-4cf6-a5ec-5551c0ab825d
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '1cf45915-f111-4cf6-a5ec-5551c0ab825d'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Wilson
    -- ID: 1d1b19d4-0ce4-48d5-bacc-07b1507f2645
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '1d1b19d4-0ce4-48d5-bacc-07b1507f2645'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew Lewis
    -- ID: 1d3a051f-e8cc-4c2d-8ab5-cff57ab3e2c4
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = '1d3a051f-e8cc-4c2d-8ab5-cff57ab3e2c4'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Richardson
    -- ID: 1db16f24-311f-4779-8865-7cc6141ec712
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '1db16f24-311f-4779-8865-7cc6141ec712'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Martinez
    -- ID: 1e57cac5-2537-4e98-a0e3-2cd6e5b4ad98
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '1e57cac5-2537-4e98-a0e3-2cd6e5b4ad98'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Anderson
    -- ID: 1f7465c2-10c5-4e8a-954f-081c52d48641
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '1f7465c2-10c5-4e8a-954f-081c52d48641'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Medical Writer
    -- ID: 1f926750-382d-41d4-9efd-7cb483b7266b
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '1f926750-382d-41d4-9efd-7cb483b7266b'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Hassan Al-Rashid
    -- ID: 205a75ba-0241-41e1-9540-1f2e72d958d4
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '205a75ba-0241-41e1-9540-1f2e72d958d4'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Martinez
    -- ID: 20b939f5-a628-4536-a983-e462046f469c
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '20b939f5-a628-4536-a983-e462046f469c'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Rebecca Martinez
    -- ID: 2108ab29-76bc-4a39-aad2-790398ceda1d
    UPDATE public.personas
    SET
        role_id = '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '2108ab29-76bc-4a39-aad2-790398ceda1d'::uuid
      AND (role_id IS DISTINCT FROM '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Monica Flores
    -- ID: 212473a8-e389-4cfa-bf4b-c9c3d7cba003
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '212473a8-e389-4cfa-bf4b-c9c3d7cba003'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elizabeth Rodriguez
    -- ID: 21ac5543-f67e-4dc1-b78a-772fd0ff606f
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '21ac5543-f67e-4dc1-b78a-772fd0ff606f'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Davis
    -- ID: 21db6c5d-cca6-4511-8a0c-3fcc5911da83
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '21db6c5d-cca6-4511-8a0c-3fcc5911da83'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Wilson
    -- ID: 220f9c90-9cc4-477c-ae08-f9101eb8a0cc
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '220f9c90-9cc4-477c-ae08-f9101eb8a0cc'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Clark
    -- ID: 2245af76-a947-4ed4-9635-c75002316aa1
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '2245af76-a947-4ed4-9635-c75002316aa1'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Kevin Murphy
    -- ID: 224d07cd-659e-4925-ab56-3ecf86c7f752
    UPDATE public.personas
    SET
        role_id = '1cd1953d-301e-4ad7-995c-6137fa319ada'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid,
        updated_at = NOW()
    WHERE id = '224d07cd-659e-4925-ab56-3ecf86c7f752'::uuid
      AND (role_id IS DISTINCT FROM '1cd1953d-301e-4ad7-995c-6137fa319ada'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lisa Anderson
    -- ID: 228e7315-7b74-4b64-8121-7e4d9bedd0f5
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '228e7315-7b74-4b64-8121-7e4d9bedd0f5'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Moore
    -- ID: 229431b5-35ec-4f4b-97a5-9657d3387267
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '229431b5-35ec-4f4b-97a5-9657d3387267'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Ryan O''Connor
    -- ID: 22c04be8-2a62-41a0-9035-cafa8a65ab32
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '22c04be8-2a62-41a0-9035-cafa8a65ab32'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Martinez
    -- ID: 234b6abc-3b4c-4ec8-84f2-b2dbbdbea03b
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '234b6abc-3b4c-4ec8-84f2-b2dbbdbea03b'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Andrew Thompson
    -- ID: 23ad8e01-3177-470f-ba73-6f0e333a4f82
    UPDATE public.personas
    SET
        role_id = 'df1a13c8-dfe3-4ace-bf78-0f9a9ac63462'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid,
        updated_at = NOW()
    WHERE id = '23ad8e01-3177-470f-ba73-6f0e333a4f82'::uuid
      AND (role_id IS DISTINCT FROM 'df1a13c8-dfe3-4ace-bf78-0f9a9ac63462'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Martinez
    -- ID: 24f19270-04af-4f04-8be0-9ebf263b30c2
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '24f19270-04af-4f04-8be0-9ebf263b30c2'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Anderson
    -- ID: 2681aa75-f9dd-4ecd-9b3d-8ac12b174f71
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '2681aa75-f9dd-4ecd-9b3d-8ac12b174f71'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Johnson
    -- ID: 26a2535f-3e08-425a-8665-7b9650837d2a
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '26a2535f-3e08-425a-8665-7b9650837d2a'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Richard Martinez
    -- ID: 271998e5-a6d9-429a-b6d4-eafb8465a2b1
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '271998e5-a6d9-429a-b6d4-eafb8465a2b1'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Johnson
    -- ID: 27e8d9a9-26f6-4bcc-9183-43562b7f3f8a
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '27e8d9a9-26f6-4bcc-9183-43562b7f3f8a'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Wilson
    -- ID: 28029dc4-6979-4923-9caf-66c0367ed85b
    UPDATE public.personas
    SET
        role_id = '8d6ca186-f70a-4a13-a7b3-e32abb59f80b'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '28029dc4-6979-4923-9caf-66c0367ed85b'::uuid
      AND (role_id IS DISTINCT FROM '8d6ca186-f70a-4a13-a7b3-e32abb59f80b'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Lewis
    -- ID: 281642a5-204a-44a1-974e-410924ce1d8e
    UPDATE public.personas
    SET
        role_id = '59f6174c-cd72-462b-830c-235bb20099ac'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid,
        updated_at = NOW()
    WHERE id = '281642a5-204a-44a1-974e-410924ce1d8e'::uuid
      AND (role_id IS DISTINCT FROM '59f6174c-cd72-462b-830c-235bb20099ac'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Lopez
    -- ID: 282c0f34-02fb-4eb0-b1e3-2a8f34844d64
    UPDATE public.personas
    SET
        role_id = '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid,
        updated_at = NOW()
    WHERE id = '282c0f34-02fb-4eb0-b1e3-2a8f34844d64'::uuid
      AND (role_id IS DISTINCT FROM '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Garcia
    -- ID: 28546ae1-5f96-4b5f-824a-d75326f4dde7
    UPDATE public.personas
    SET
        role_id = '8716392f-cd29-4ada-b38d-e9f864108b55'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '84674c58-2cd7-4f71-8bde-232539a1e451'::uuid,
        updated_at = NOW()
    WHERE id = '28546ae1-5f96-4b5f-824a-d75326f4dde7'::uuid
      AND (role_id IS DISTINCT FROM '8716392f-cd29-4ada-b38d-e9f864108b55'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '84674c58-2cd7-4f71-8bde-232539a1e451'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Wilson
    -- ID: 2892af66-f93f-4081-bc27-30d87449135c
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '2892af66-f93f-4081-bc27-30d87449135c'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Moore
    -- ID: 290731b4-3be9-4b44-82b9-5cfed41d830c
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '290731b4-3be9-4b44-82b9-5cfed41d830c'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Davis
    -- ID: 292230c1-036a-42a7-9a61-e7e85fd51794
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '292230c1-036a-42a7-9a61-e7e85fd51794'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Johnson
    -- ID: 29e5b47e-3fe3-4d81-823b-9bd5f9044d15
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '29e5b47e-3fe3-4d81-823b-9bd5f9044d15'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Peterson
    -- ID: 2a3ec062-39ab-4baf-b025-1f651a4b03c8
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '2a3ec062-39ab-4baf-b025-1f651a4b03c8'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Thompson
    -- ID: 2b2df020-fbab-43bc-b097-9018d4e78b96
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '2b2df020-fbab-43bc-b097-9018d4e78b96'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lawrence Garcia
    -- ID: 2ba2193f-6efe-4b63-ae2c-ae0c0698bec3
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '2ba2193f-6efe-4b63-ae2c-ae0c0698bec3'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lisa King
    -- ID: 2c12ee0e-ee49-4771-bf48-7ec7a98f1352
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = '2c12ee0e-ee49-4771-bf48-7ec7a98f1352'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Andrew Miller
    -- ID: 2cde43bb-5421-4d04-9b17-2f88713e14b8
    UPDATE public.personas
    SET
        role_id = '59f6174c-cd72-462b-830c-235bb20099ac'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid,
        updated_at = NOW()
    WHERE id = '2cde43bb-5421-4d04-9b17-2f88713e14b8'::uuid
      AND (role_id IS DISTINCT FROM '59f6174c-cd72-462b-830c-235bb20099ac'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Lee
    -- ID: 2cf89e8d-73a9-4463-b69f-718bdc78d372
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '2cf89e8d-73a9-4463-b69f-718bdc78d372'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Hayes
    -- ID: 2cff5e70-0d16-473a-93fd-d2b5d22b55e6
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '2cff5e70-0d16-473a-93fd-d2b5d22b55e6'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Clinical Operations Manager
    -- ID: 2d0ddd0f-e0c2-4761-a7ac-98a1c37c1b12
    UPDATE public.personas
    SET
        role_id = '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid,
        updated_at = NOW()
    WHERE id = '2d0ddd0f-e0c2-4761-a7ac-98a1c37c1b12'::uuid
      AND (role_id IS DISTINCT FROM '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Priya Singh
    -- ID: 2d64501b-450a-4685-a455-a992c2d6e817
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '2d64501b-450a-4685-a455-a992c2d6e817'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Garcia
    -- ID: 2d75a398-566a-42b5-995a-c73bc7bc014d
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '2d75a398-566a-42b5-995a-c73bc7bc014d'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Thomas Williams
    -- ID: 2d7a5302-07a0-4d72-8cfd-f742b9011ea2
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '2d7a5302-07a0-4d72-8cfd-f742b9011ea2'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Chen
    -- ID: 2e2a60cb-d07b-440d-b82e-a3075fb439e9
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '2e2a60cb-d07b-440d-b82e-a3075fb439e9'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Kevin Martinez
    -- ID: 2fad8a45-3a02-4c56-9764-b5b4db4c533e
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '2fad8a45-3a02-4c56-9764-b5b4db4c533e'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sophia Andersen
    -- ID: 2fcc2782-f114-444d-b3ce-a2913cbd3551
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '2fcc2782-f114-444d-b3ce-a2913cbd3551'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Davis
    -- ID: 2ff920b8-8643-4059-bcfa-15cff7181adc
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '2ff920b8-8643-4059-bcfa-15cff7181adc'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Thomas Wilson
    -- ID: 30eac745-eb26-42d3-8577-a6b320a4b5f0
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '30eac745-eb26-42d3-8577-a6b320a4b5f0'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Martinez
    -- ID: 31487ef5-90d4-4bfc-a336-5ea32fe21d00
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '31487ef5-90d4-4bfc-a336-5ea32fe21d00'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Johnson
    -- ID: 317e9972-b69f-48f9-8333-bc59aa3b3f53
    UPDATE public.personas
    SET
        role_id = '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '317e9972-b69f-48f9-8333-bc59aa3b3f53'::uuid
      AND (role_id IS DISTINCT FROM '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Davis
    -- ID: 31cfa68f-66bf-473d-97ab-ae2ce07e42ce
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '31cfa68f-66bf-473d-97ab-ae2ce07e42ce'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Thompson
    -- ID: 325dee45-22a7-4dd3-a771-f7aa3fea8eb9
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '325dee45-22a7-4dd3-a771-f7aa3fea8eb9'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Rodriguez
    -- ID: 32bbb4a9-e147-4457-9f5b-a599d5b3ab3f
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '32bbb4a9-e147-4457-9f5b-a599d5b3ab3f'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Walker
    -- ID: 32e0ba6b-d006-4ce8-adb5-bb9158fd9407
    UPDATE public.personas
    SET
        role_id = '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = '32e0ba6b-d006-4ce8-adb5-bb9158fd9407'::uuid
      AND (role_id IS DISTINCT FROM '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Harris
    -- ID: 32f0ca0b-4c4a-48ed-bd7e-dc147b9c16d7
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '32f0ca0b-4c4a-48ed-bd7e-dc147b9c16d7'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Kenji Yamamoto
    -- ID: 339e8dc5-d5ee-490e-bf97-dad6d5706487
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '339e8dc5-d5ee-490e-bf97-dad6d5706487'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Carlos Rodriguez
    -- ID: 33fdaf14-2e3a-474d-8090-f26712606cd3
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '33fdaf14-2e3a-474d-8090-f26712606cd3'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elizabeth Martinez
    -- ID: 34442f49-e555-4206-994f-6bdd882e454f
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '34442f49-e555-4206-994f-6bdd882e454f'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Garcia
    -- ID: 34574a99-1151-4ec0-b125-7e0f95cdf285
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '34574a99-1151-4ec0-b125-7e0f95cdf285'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jessica Hill
    -- ID: 34a006a8-e053-4781-8404-329593013f1a
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '34a006a8-e053-4781-8404-329593013f1a'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Wilson
    -- ID: 3534e571-9f62-40fa-bfbe-10d51108ef53
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '3534e571-9f62-40fa-bfbe-10d51108ef53'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Garcia
    -- ID: 354bfa8b-5df8-4a3b-b2e1-e461d42e1a13
    UPDATE public.personas
    SET
        role_id = 'c6f91d15-8a63-4140-928b-bd82b39dd33d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = '354bfa8b-5df8-4a3b-b2e1-e461d42e1a13'::uuid
      AND (role_id IS DISTINCT FROM 'c6f91d15-8a63-4140-928b-bd82b39dd33d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Allen
    -- ID: 368a1fbc-8e5e-4957-b565-9eada135957b
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '368a1fbc-8e5e-4957-b565-9eada135957b'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sophie Moreau
    -- ID: 36efcbd3-7769-4c5a-af49-3c32f6530a7f
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '36efcbd3-7769-4c5a-af49-3c32f6530a7f'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sophia Andersen
    -- ID: 37424a6d-ea14-4d68-bd7f-59a157fb7156
    UPDATE public.personas
    SET
        role_id = '2127d5cf-f94c-4456-a0c7-015c502e27bc'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid,
        updated_at = NOW()
    WHERE id = '37424a6d-ea14-4d68-bd7f-59a157fb7156'::uuid
      AND (role_id IS DISTINCT FROM '2127d5cf-f94c-4456-a0c7-015c502e27bc'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Garcia
    -- ID: 37eba385-b931-4d01-b1c1-3f1b2aa7dd6f
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '37eba385-b931-4d01-b1c1-3f1b2aa7dd6f'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Anderson
    -- ID: 37fc184a-5b1c-4b50-80ae-9003d78ce6e8
    UPDATE public.personas
    SET
        role_id = '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid,
        updated_at = NOW()
    WHERE id = '37fc184a-5b1c-4b50-80ae-9003d78ce6e8'::uuid
      AND (role_id IS DISTINCT FROM '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda Martinez
    -- ID: 38bf1fba-63c7-43ee-9c14-46f4b67e84d2
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '38bf1fba-63c7-43ee-9c14-46f4b67e84d2'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Thompson
    -- ID: 3919e3d3-41c4-4a11-af0f-67b2612ebdcd
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '3919e3d3-41c4-4a11-af0f-67b2612ebdcd'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert King
    -- ID: 392ef37d-1df4-4aae-a7b5-09b6f410687a
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '392ef37d-1df4-4aae-a7b5-09b6f410687a'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Chen
    -- ID: 394b3299-2271-4577-b1d5-cca7d5cbcfdb
    UPDATE public.personas
    SET
        role_id = '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '394b3299-2271-4577-b1d5-cca7d5cbcfdb'::uuid
      AND (role_id IS DISTINCT FROM '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Nicole Foster
    -- ID: 394c9f7d-6c8d-4f95-9a99-989acaaa57d3
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '394c9f7d-6c8d-4f95-9a99-989acaaa57d3'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Maria Gonzalez
    -- ID: 39f3c2a8-60b9-4532-8603-3de82ff667aa
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '39f3c2a8-60b9-4532-8603-3de82ff667aa'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Rebecca Thompson
    -- ID: 3adb81cf-4004-4740-8f25-a555dd89da2b
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '3adb81cf-4004-4740-8f25-a555dd89da2b'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Rebecca Wilson
    -- ID: 3b1cdf71-04a3-40ae-977d-3267ee2bf188
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '3b1cdf71-04a3-40ae-977d-3267ee2bf188'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Susan Lee
    -- ID: 3b831627-7bfe-4444-b40b-c6b19c095c95
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '3b831627-7bfe-4444-b40b-c6b19c095c95'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Lee
    -- ID: 3b9993a9-8ec5-449f-8df8-52a8c709c2b0
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '3b9993a9-8ec5-449f-8df8-52a8c709c2b0'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Lee
    -- ID: 3bbd3204-71e2-46a3-8882-a9668648bfa6
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '3bbd3204-71e2-46a3-8882-a9668648bfa6'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rachel Lewis
    -- ID: 3d315c79-16ba-4efc-9487-25ebecd7a893
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '3d315c79-16ba-4efc-9487-25ebecd7a893'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Lewis
    -- ID: 3e49571b-1bc3-44a0-be83-9ef7e2288273
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '3e49571b-1bc3-44a0-be83-9ef7e2288273'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lauren Martinez
    -- ID: 3f2b41bb-b385-49e6-a40c-7e892c54b4cf
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '3f2b41bb-b385-49e6-a40c-7e892c54b4cf'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew Jones
    -- ID: 3f3808e6-89f3-46c9-aa76-25bfa6d3d349
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '3f3808e6-89f3-46c9-aa76-25bfa6d3d349'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Hassan Al-Rashid
    -- ID: 3f502092-94b9-4d1e-b3a2-29cc7c595ca4
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '3f502092-94b9-4d1e-b3a2-29cc7c595ca4'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Rodriguez
    -- ID: 3f636531-41f7-4ec8-8e32-40f32449d9d4
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = '3f636531-41f7-4ec8-8e32-40f32449d9d4'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Wilson
    -- ID: 3f921352-5a71-4da2-8d6e-a9d137b503a0
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '3f921352-5a71-4da2-8d6e-a9d137b503a0'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Taylor
    -- ID: 40f8355e-7974-4dad-8c25-e12b6bee2c75
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '40f8355e-7974-4dad-8c25-e12b6bee2c75'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lisa Garcia
    -- ID: 416eca36-1481-4831-9b27-f0766bcba593
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '416eca36-1481-4831-9b27-f0766bcba593'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Rodriguez
    -- ID: 42108718-efc7-4663-8d55-0f6b9268ad77
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '42108718-efc7-4663-8d55-0f6b9268ad77'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Bennett
    -- ID: 42120d75-8470-407b-869b-31b6c56dcaef
    UPDATE public.personas
    SET
        role_id = '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid,
        updated_at = NOW()
    WHERE id = '42120d75-8470-407b-869b-31b6c56dcaef'::uuid
      AND (role_id IS DISTINCT FROM '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Marco Bellini
    -- ID: 42592998-70fc-4e23-b960-42978a00b021
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '42592998-70fc-4e23-b960-42978a00b021'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Victoria Thompson
    -- ID: 427f6ddf-2904-4748-b0f0-ea3c7ef819fa
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '427f6ddf-2904-4748-b0f0-ea3c7ef819fa'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Thompson
    -- ID: 42c60a9f-202c-4332-806c-aaa2067f336f
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '42c60a9f-202c-4332-806c-aaa2067f336f'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Thompson
    -- ID: 43051993-9ec7-4c3b-b0d1-fcbee002ce77
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '43051993-9ec7-4c3b-b0d1-fcbee002ce77'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Johnson
    -- ID: 4309d130-0c3b-47b6-a827-ab419acfecbe
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '4309d130-0c3b-47b6-a827-ab419acfecbe'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Brown
    -- ID: 4372eb9b-2773-4783-8cb9-125a2d7526c1
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '4372eb9b-2773-4783-8cb9-125a2d7526c1'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Garcia
    -- ID: 440ec2f4-bcc6-4a04-a699-11e471f1a430
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '440ec2f4-bcc6-4a04-a699-11e471f1a430'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Priya Sharma
    -- ID: 441312f9-64dd-49ac-b9b9-61c3c8358a49
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '441312f9-64dd-49ac-b9b9-61c3c8358a49'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Rodriguez
    -- ID: 44976a33-c58c-4e15-950d-569a1886f4a9
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '44976a33-c58c-4e15-950d-569a1886f4a9'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Lee
    -- ID: 450af61a-797e-4a78-b7ac-492b85f9bc85
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = '450af61a-797e-4a78-b7ac-492b85f9bc85'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Wilson
    -- ID: 45ad9755-77a4-436a-8e0a-79bb5a5ecc87
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '45ad9755-77a4-436a-8e0a-79bb5a5ecc87'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Kevin Murphy
    -- ID: 45d5666a-9739-47f0-bfe5-66bda70f937d
    UPDATE public.personas
    SET
        role_id = '16ad9006-7b35-4b08-8386-d14ea7cf61fc'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid,
        updated_at = NOW()
    WHERE id = '45d5666a-9739-47f0-bfe5-66bda70f937d'::uuid
      AND (role_id IS DISTINCT FROM '16ad9006-7b35-4b08-8386-d14ea7cf61fc'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Matthew Brown
    -- ID: 46397f9d-05c4-4722-98b7-eff88967d278
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '46397f9d-05c4-4722-98b7-eff88967d278'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Giovanni Rossi
    -- ID: 46417532-979f-47de-abf1-a2b06f689691
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = '46417532-979f-47de-abf1-a2b06f689691'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Peterson
    -- ID: 467e9d3c-4cdd-49dd-add8-1948b262fd0f
    UPDATE public.personas
    SET
        role_id = '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid,
        updated_at = NOW()
    WHERE id = '467e9d3c-4cdd-49dd-add8-1948b262fd0f'::uuid
      AND (role_id IS DISTINCT FROM '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Allen
    -- ID: 46d923d7-eedd-495d-8f90-ef410eb9ac92
    UPDATE public.personas
    SET
        role_id = 'f63b42bd-5ffd-4071-b159-90149f76a22d'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '46d923d7-eedd-495d-8f90-ef410eb9ac92'::uuid
      AND (role_id IS DISTINCT FROM 'f63b42bd-5ffd-4071-b159-90149f76a22d'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Rodriguez
    -- ID: 46fc27a1-ac0a-4925-8690-5179af991298
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '46fc27a1-ac0a-4925-8690-5179af991298'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Melissa Gonzalez
    -- ID: 4724df78-3fd7-4373-bcec-34925e53ca51
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '4724df78-3fd7-4373-bcec-34925e53ca51'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Chen
    -- ID: 47ca0d14-9a83-49cc-b0f0-2d80c9fdc66f
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '47ca0d14-9a83-49cc-b0f0-2d80c9fdc66f'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Wilson
    -- ID: 493bf397-a4e0-40bc-b296-235fa1901445
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '493bf397-a4e0-40bc-b296-235fa1901445'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Garcia
    -- ID: 495b4fe4-7b4d-4c88-a5b3-76b844bbf88e
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '495b4fe4-7b4d-4c88-a5b3-76b844bbf88e'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Hill
    -- ID: 49780551-67f6-4d13-a98b-0f065fa012e2
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = '49780551-67f6-4d13-a98b-0f065fa012e2'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Lee
    -- ID: 4a22dee2-fb9b-4639-b2a4-18b3771c9b94
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '4a22dee2-fb9b-4639-b2a4-18b3771c9b94'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Garcia
    -- ID: 4a23c0ab-1dd9-4501-93a5-26aa233b1abf
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '4a23c0ab-1dd9-4501-93a5-26aa233b1abf'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Brown
    -- ID: 4a41c1dd-104a-4d82-ab19-dbc0bc03d8bd
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '4a41c1dd-104a-4d82-ab19-dbc0bc03d8bd'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Wilson
    -- ID: 4a57626e-6ff6-4dbf-aeed-f0c8cd8cbc4e
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '4a57626e-6ff6-4dbf-aeed-f0c8cd8cbc4e'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Andrew Lopez
    -- ID: 4acedd36-5a28-4f09-a066-011a534935d0
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '4acedd36-5a28-4f09-a066-011a534935d0'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Priya Singh
    -- ID: 4ba33520-c3b5-4640-939f-2704d6e0c227
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '4ba33520-c3b5-4640-939f-2704d6e0c227'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Garcia
    -- ID: 4c02e84a-e0ac-40f7-8003-e863ee9115a7
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '4c02e84a-e0ac-40f7-8003-e863ee9115a7'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Chen
    -- ID: 4c0ee0e6-c7aa-4356-bc47-82406efd921a
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '4c0ee0e6-c7aa-4356-bc47-82406efd921a'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Lee
    -- ID: 4c237550-f768-4b24-bc29-7206532bd72c
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '4c237550-f768-4b24-bc29-7206532bd72c'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Thomas Clarke
    -- ID: 4c3b517d-7e56-4b8a-8fec-69cb32f00138
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '4c3b517d-7e56-4b8a-8fec-69cb32f00138'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Martinez
    -- ID: 4c3eab91-220c-4dee-a10d-dd573565b554
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '4c3eab91-220c-4dee-a10d-dd573565b554'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: John Wilson
    -- ID: 4cb412aa-5e1d-4eb1-b1d6-9edbfe73857a
    UPDATE public.personas
    SET
        role_id = '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '4cb412aa-5e1d-4eb1-b1d6-9edbfe73857a'::uuid
      AND (role_id IS DISTINCT FROM '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Robinson
    -- ID: 4cf970a7-0d5d-4648-8ada-3c4949d6d9cc
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '4cf970a7-0d5d-4648-8ada-3c4949d6d9cc'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Taylor
    -- ID: 4d4cf7c9-8d9c-479a-ae64-a0393cf02219
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '4d4cf7c9-8d9c-479a-ae64-a0393cf02219'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Garcia
    -- ID: 4e1bb453-3e6e-426e-a82e-5b01908e9427
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '4e1bb453-3e6e-426e-a82e-5b01908e9427'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Rodriguez
    -- ID: 4e487764-822a-4ac1-af1c-7164c6d0bb85
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '4e487764-822a-4ac1-af1c-7164c6d0bb85'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Brown
    -- ID: 4e884653-b44c-4c66-aeae-52712873e3c0
    UPDATE public.personas
    SET
        role_id = '8716392f-cd29-4ada-b38d-e9f864108b55'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '84674c58-2cd7-4f71-8bde-232539a1e451'::uuid,
        updated_at = NOW()
    WHERE id = '4e884653-b44c-4c66-aeae-52712873e3c0'::uuid
      AND (role_id IS DISTINCT FROM '8716392f-cd29-4ada-b38d-e9f864108b55'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '84674c58-2cd7-4f71-8bde-232539a1e451'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Hall
    -- ID: 4e983687-0797-4c2b-88d7-8df0a7878218
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '4e983687-0797-4c2b-88d7-8df0a7878218'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer White
    -- ID: 4eabaf65-42c2-458f-8285-fdd66322bdb0
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '4eabaf65-42c2-458f-8285-fdd66322bdb0'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lisa White
    -- ID: 4ef4dcdd-8f10-413d-9b74-1761df147244
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '4ef4dcdd-8f10-413d-9b74-1761df147244'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Rodriguez
    -- ID: 4fb5c1c2-acf0-489a-8624-ef6021c2b282
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '4fb5c1c2-acf0-489a-8624-ef6021c2b282'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lisa Anderson
    -- ID: 4fe7ecf6-5bc0-4e35-9282-ec2b605bcf77
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '4fe7ecf6-5bc0-4e35-9282-ec2b605bcf77'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Johnson
    -- ID: 5018b786-f00d-4296-9af8-5fef036f1a3e
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '5018b786-f00d-4296-9af8-5fef036f1a3e'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Matthew Brown
    -- ID: 505bc904-10f1-4716-90eb-726da695d530
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '505bc904-10f1-4716-90eb-726da695d530'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Priya Singh
    -- ID: 506c5160-5608-472e-b34a-0a71e4f8789a
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '506c5160-5608-472e-b34a-0a71e4f8789a'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Davis
    -- ID: 5072a473-f3a4-4ec4-9efc-88d249bcb5d8
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '5072a473-f3a4-4ec4-9efc-88d249bcb5d8'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Wilson
    -- ID: 507413c8-9201-494d-b388-2d74af0e7d3c
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = '507413c8-9201-494d-b388-2d74af0e7d3c'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Rodriguez
    -- ID: 50a51dce-0141-4479-a024-3407742a5c02
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '50a51dce-0141-4479-a024-3407742a5c02'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Clark
    -- ID: 50c926d7-5f00-496f-b537-bde552e3ceba
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '50c926d7-5f00-496f-b537-bde552e3ceba'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Allen
    -- ID: 50f5838a-edfa-4eb1-ade1-e3692d4a5174
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '50f5838a-edfa-4eb1-ade1-e3692d4a5174'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Anderson
    -- ID: 51109695-009d-4458-96c2-b6d4e4c58204
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '51109695-009d-4458-96c2-b6d4e4c58204'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Daniel Lee
    -- ID: 51d1b14b-6283-44cc-948c-cbe0c279c6db
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '51d1b14b-6283-44cc-948c-cbe0c279c6db'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Lee
    -- ID: 52b13d34-7d90-4cdb-8e05-37c6698ed286
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = '52b13d34-7d90-4cdb-8e05-37c6698ed286'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Martinez
    -- ID: 53eb3e89-30ce-465a-99fb-f68588f42b12
    UPDATE public.personas
    SET
        role_id = '240e8b25-3ba8-47ad-bdc6-1a7344d2dae7'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '53eb3e89-30ce-465a-99fb-f68588f42b12'::uuid
      AND (role_id IS DISTINCT FROM '240e8b25-3ba8-47ad-bdc6-1a7344d2dae7'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Brown
    -- ID: 5485bddb-4731-40fb-908b-87429162bab0
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '5485bddb-4731-40fb-908b-87429162bab0'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Chen
    -- ID: 5534d5e5-a7b9-45f2-8390-207b54f1fa96
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '5534d5e5-a7b9-45f2-8390-207b54f1fa96'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Garcia
    -- ID: 5562f64d-cae2-469b-ae81-b2289535d78a
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '5562f64d-cae2-469b-ae81-b2289535d78a'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Thompson
    -- ID: 55812c76-45c6-452c-9aac-a5a8da132c07
    UPDATE public.personas
    SET
        role_id = '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid,
        updated_at = NOW()
    WHERE id = '55812c76-45c6-452c-9aac-a5a8da132c07'::uuid
      AND (role_id IS DISTINCT FROM '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Anderson
    -- ID: 55c8c5f8-afc8-4d2e-8ef7-c364c99745c9
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '55c8c5f8-afc8-4d2e-8ef7-c364c99745c9'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Lopez
    -- ID: 56a80150-f9bb-4d0d-8274-09cb0cede1ae
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '56a80150-f9bb-4d0d-8274-09cb0cede1ae'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Rodriguez
    -- ID: 56b8c8ba-6872-46c2-b0fe-ff5f640a7761
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = '56b8c8ba-6872-46c2-b0fe-ff5f640a7761'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Chen
    -- ID: 57005dba-834a-4da8-aa1c-217e43eb7053
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '57005dba-834a-4da8-aa1c-217e43eb7053'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Maria Gonzalez
    -- ID: 572266d9-7341-4037-8c76-85979f515dc1
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '572266d9-7341-4037-8c76-85979f515dc1'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Matthew Brown
    -- ID: 574c7dd9-c90c-4819-9c45-b213588f1216
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '574c7dd9-c90c-4819-9c45-b213588f1216'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Rodriguez
    -- ID: 577f52d6-f423-47db-8c9f-cc6c1d938920
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '577f52d6-f423-47db-8c9f-cc6c1d938920'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Joseph Jones
    -- ID: 57a9f329-ee09-428f-9473-9a52a33dca1e
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '57a9f329-ee09-428f-9473-9a52a33dca1e'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Taylor
    -- ID: 58dd89c9-25a6-4da6-bf57-414129e4fbe6
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '58dd89c9-25a6-4da6-bf57-414129e4fbe6'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rachel Harris
    -- ID: 594f29ab-f687-4ca1-8d1d-edff1a5b782c
    UPDATE public.personas
    SET
        role_id = '1f1fd08d-2f4e-4121-b480-a3e74a174fca'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = '594f29ab-f687-4ca1-8d1d-edff1a5b782c'::uuid
      AND (role_id IS DISTINCT FROM '1f1fd08d-2f4e-4121-b480-a3e74a174fca'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Davis
    -- ID: 59aafaf0-e494-4e41-9553-c23996d57e5d
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '59aafaf0-e494-4e41-9553-c23996d57e5d'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lisa Rodriguez
    -- ID: 59bbcba3-c5ac-4fcf-9e22-ebc3f2310177
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '59bbcba3-c5ac-4fcf-9e22-ebc3f2310177'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Clark
    -- ID: 5aee138b-8a86-4c8f-97f2-83fbc5826617
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '5aee138b-8a86-4c8f-97f2-83fbc5826617'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rebecca Hernandez
    -- ID: 5b03c534-b503-47a0-9867-b831328ba69d
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '5b03c534-b503-47a0-9867-b831328ba69d'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Marcus Chen
    -- ID: 5b2d464e-6d5f-4e91-8f96-6e2eef564251
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '5b2d464e-6d5f-4e91-8f96-6e2eef564251'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Hill
    -- ID: 5b488784-0af4-4c2d-b043-4a8c979ad93f
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '5b488784-0af4-4c2d-b043-4a8c979ad93f'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Kim
    -- ID: 5c060967-1aec-41b2-a50e-9390dcf27086
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '5c060967-1aec-41b2-a50e-9390dcf27086'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Hall
    -- ID: 5c1eb606-d50b-4ab7-80a6-66364d8f592d
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '5c1eb606-d50b-4ab7-80a6-66364d8f592d'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Johnson
    -- ID: 5c8d7e9e-2ace-40ed-a197-692aaee6cfe8
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '5c8d7e9e-2ace-40ed-a197-692aaee6cfe8'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia White
    -- ID: 5ca544e6-4e95-4695-9a81-2fd40b5ac3f7
    UPDATE public.personas
    SET
        role_id = '59f6174c-cd72-462b-830c-235bb20099ac'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid,
        updated_at = NOW()
    WHERE id = '5ca544e6-4e95-4695-9a81-2fd40b5ac3f7'::uuid
      AND (role_id IS DISTINCT FROM '59f6174c-cd72-462b-830c-235bb20099ac'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Rebecca Sullivan
    -- ID: 5d15a5bb-eb18-4955-a0a4-2b23f3882812
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '5d15a5bb-eb18-4955-a0a4-2b23f3882812'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Lopez
    -- ID: 5dde094c-daf7-4e8f-a318-90202d58db1e
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '5dde094c-daf7-4e8f-a318-90202d58db1e'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lauren Martinez
    -- ID: 5e2e7a11-b323-44f2-a9ff-7efa85b2ac79
    UPDATE public.personas
    SET
        role_id = 'f63b42bd-5ffd-4071-b159-90149f76a22d'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '5e2e7a11-b323-44f2-a9ff-7efa85b2ac79'::uuid
      AND (role_id IS DISTINCT FROM 'f63b42bd-5ffd-4071-b159-90149f76a22d'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Wilson
    -- ID: 5e52e28a-952d-439d-9b0f-4bc5fed06c48
    UPDATE public.personas
    SET
        role_id = '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = '5e52e28a-952d-439d-9b0f-4bc5fed06c48'::uuid
      AND (role_id IS DISTINCT FROM '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Natalia Volkov
    -- ID: 614df35e-c90c-4c26-87d4-e68288a67d23
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '614df35e-c90c-4c26-87d4-e68288a67d23'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Anderson
    -- ID: 628c8426-5d50-4e2c-b650-f600b8e37977
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '628c8426-5d50-4e2c-b650-f600b8e37977'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Rodriguez
    -- ID: 62a0a895-a8fd-47c9-8010-4787a10cf939
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '62a0a895-a8fd-47c9-8010-4787a10cf939'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Daniel Young
    -- ID: 62fe3e34-7a1c-4951-8c84-92a63b876019
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '62fe3e34-7a1c-4951-8c84-92a63b876019'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Mark Thompson
    -- ID: 63034b53-6166-4f1c-94f5-b9bb4c9b427a
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '63034b53-6166-4f1c-94f5-b9bb4c9b427a'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Allen
    -- ID: 6343dd69-9fee-4243-9b3e-173908e77f8e
    UPDATE public.personas
    SET
        role_id = '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = '6343dd69-9fee-4243-9b3e-173908e77f8e'::uuid
      AND (role_id IS DISTINCT FROM '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rachel Wright
    -- ID: 635267f7-ffe7-463f-941b-fffbbde46580
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '635267f7-ffe7-463f-941b-fffbbde46580'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Thomas Robinson
    -- ID: 64041141-a305-42e8-8a76-13a2c89054b3
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '64041141-a305-42e8-8a76-13a2c89054b3'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Lee
    -- ID: 65aab969-880a-4c77-aaee-01dc36eec6ad
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '65aab969-880a-4c77-aaee-01dc36eec6ad'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Anderson
    -- ID: 66c94beb-176f-431c-b4bf-b83321c1e72d
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '66c94beb-176f-431c-b4bf-b83321c1e72d'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kimberly Anderson
    -- ID: 67a93025-4acc-45c4-8529-b3d3df9b89fa
    UPDATE public.personas
    SET
        role_id = 'bbbbd1ec-666d-4710-9049-a3669109464d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'b02f8883-25b4-4582-8c95-ccc46aa1bd7a'::uuid,
        updated_at = NOW()
    WHERE id = '67a93025-4acc-45c4-8529-b3d3df9b89fa'::uuid
      AND (role_id IS DISTINCT FROM 'bbbbd1ec-666d-4710-9049-a3669109464d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'b02f8883-25b4-4582-8c95-ccc46aa1bd7a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lisa Anderson
    -- ID: 67d5ce14-ca89-426b-bbc6-8706fc093d35
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '67d5ce14-ca89-426b-bbc6-8706fc093d35'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Andrew Thompson
    -- ID: 67f2aa04-31c2-4ab3-8691-a83b9a62e93a
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '67f2aa04-31c2-4ab3-8691-a83b9a62e93a'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Martin
    -- ID: 682b64f9-a862-4975-ae93-5a5afc161d85
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '682b64f9-a862-4975-ae93-5a5afc161d85'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Lewis
    -- ID: 683d0c9a-6356-417c-9a62-f72192d262d7
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '683d0c9a-6356-417c-9a62-f72192d262d7'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Allen
    -- ID: 6851ce16-4fde-4078-9a9f-bc2c18eb56e9
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '6851ce16-4fde-4078-9a9f-bc2c18eb56e9'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Lee
    -- ID: 68af8941-5f2f-465b-be7a-aee3fc70d5ca
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '68af8941-5f2f-465b-be7a-aee3fc70d5ca'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Daniel White
    -- ID: 68f0e091-e2b6-423a-8564-31580a4aa39f
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '68f0e091-e2b6-423a-8564-31580a4aa39f'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Martinez
    -- ID: 6a0c3c0c-df48-4baf-9eb9-d3d883f483c3
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '6a0c3c0c-df48-4baf-9eb9-d3d883f483c3'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Clinical Research Director
    -- ID: 6b395380-68e1-4352-bc78-f9183219cd2d
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '6b395380-68e1-4352-bc78-f9183219cd2d'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Davis
    -- ID: 6bf6f591-9b9a-4e4a-b16c-82d4c22b4ee1
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '6bf6f591-9b9a-4e4a-b16c-82d4c22b4ee1'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michelle Chen
    -- ID: 6c389266-7239-418d-bb2e-23efef519dd3
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '6c389266-7239-418d-bb2e-23efef519dd3'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Garcia
    -- ID: 6c6f7537-15d2-4827-9cb4-837e15365e9e
    UPDATE public.personas
    SET
        role_id = '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid,
        updated_at = NOW()
    WHERE id = '6c6f7537-15d2-4827-9cb4-837e15365e9e'::uuid
      AND (role_id IS DISTINCT FROM '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Rodriguez
    -- ID: 6ce7155d-9e71-4543-9200-28a4a3a53e48
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '6ce7155d-9e71-4543-9200-28a4a3a53e48'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Johnson
    -- ID: 6d4596db-db04-4b32-b1eb-411cbe8d18c4
    UPDATE public.personas
    SET
        role_id = '8716392f-cd29-4ada-b38d-e9f864108b55'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '84674c58-2cd7-4f71-8bde-232539a1e451'::uuid,
        updated_at = NOW()
    WHERE id = '6d4596db-db04-4b32-b1eb-411cbe8d18c4'::uuid
      AND (role_id IS DISTINCT FROM '8716392f-cd29-4ada-b38d-e9f864108b55'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '84674c58-2cd7-4f71-8bde-232539a1e451'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Daniel Garcia
    -- ID: 6dcbecf9-0a4d-4b68-b945-98066659b039
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '6dcbecf9-0a4d-4b68-b945-98066659b039'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Martinez
    -- ID: 6de52139-c1ee-49aa-a973-25dc9dbbe75d
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '6de52139-c1ee-49aa-a973-25dc9dbbe75d'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Anderson
    -- ID: 6f5b97ac-98f1-4057-a0d3-2975e28b0c7b
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = '6f5b97ac-98f1-4057-a0d3-2975e28b0c7b'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Alex Rivera
    -- ID: 6f73d7ef-7673-4ebe-8a6e-72c5bd287030
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '6f73d7ef-7673-4ebe-8a6e-72c5bd287030'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Bennett
    -- ID: 6f81aa2f-269e-4874-85c0-848bc752c276
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '6f81aa2f-269e-4874-85c0-848bc752c276'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Wilson
    -- ID: 6ffc7a48-5af4-4503-8574-784a4386d318
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '6ffc7a48-5af4-4503-8574-784a4386d318'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Wilson
    -- ID: 702839d0-5479-475c-b671-62668141d9f5
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '702839d0-5479-475c-b671-62668141d9f5'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kenji Tanaka
    -- ID: 703d6251-4e1f-4b32-860e-51b7ad75dafb
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '703d6251-4e1f-4b32-860e-51b7ad75dafb'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Wilson
    -- ID: 7160b9b5-a612-4d87-afa9-f0346e1bf39a
    UPDATE public.personas
    SET
        role_id = '6b96b2e8-3e09-4785-861f-95878eb47e7e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid,
        updated_at = NOW()
    WHERE id = '7160b9b5-a612-4d87-afa9-f0346e1bf39a'::uuid
      AND (role_id IS DISTINCT FROM '6b96b2e8-3e09-4785-861f-95878eb47e7e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Taylor
    -- ID: 71baf5c0-41e3-45a9-928a-ba52ccb496e5
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '71baf5c0-41e3-45a9-928a-ba52ccb496e5'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lisa Wright
    -- ID: 71e2ffab-d46e-4446-b1cd-3059b3301a6d
    UPDATE public.personas
    SET
        role_id = '1f1fd08d-2f4e-4121-b480-a3e74a174fca'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = '71e2ffab-d46e-4446-b1cd-3059b3301a6d'::uuid
      AND (role_id IS DISTINCT FROM '1f1fd08d-2f4e-4121-b480-a3e74a174fca'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda Foster
    -- ID: 720effa0-b161-4cbf-ad83-192be3cd3ed1
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '720effa0-b161-4cbf-ad83-192be3cd3ed1'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Wilson
    -- ID: 7232b11e-5861-4682-b68d-609872c850c3
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '7232b11e-5861-4682-b68d-609872c850c3'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rachel Lewis
    -- ID: 7243c9ed-46b5-4bfc-83b3-e8f24dec56d8
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '7243c9ed-46b5-4bfc-83b3-e8f24dec56d8'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Lee
    -- ID: 72533753-71d0-4427-b291-f3aa0ef5d00b
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '72533753-71d0-4427-b291-f3aa0ef5d00b'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Garcia
    -- ID: 735db3e5-9268-4709-9ce3-2fe8eefb7b15
    UPDATE public.personas
    SET
        role_id = '8f06ad67-dd82-4b91-b614-05fb513a966d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid,
        updated_at = NOW()
    WHERE id = '735db3e5-9268-4709-9ce3-2fe8eefb7b15'::uuid
      AND (role_id IS DISTINCT FROM '8f06ad67-dd82-4b91-b614-05fb513a966d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Smith
    -- ID: 73c27f7f-11ec-4806-9a9c-8bd3e0364678
    UPDATE public.personas
    SET
        role_id = '8d6ca186-f70a-4a13-a7b3-e32abb59f80b'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '73c27f7f-11ec-4806-9a9c-8bd3e0364678'::uuid
      AND (role_id IS DISTINCT FROM '8d6ca186-f70a-4a13-a7b3-e32abb59f80b'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Thompson
    -- ID: 7405163c-8647-41d4-8e0a-1c1747b77865
    UPDATE public.personas
    SET
        role_id = '477bd57d-b848-4c5f-abff-e4e903065b72'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '871875a1-9119-4571-9fa7-b4f3584c461c'::uuid,
        updated_at = NOW()
    WHERE id = '7405163c-8647-41d4-8e0a-1c1747b77865'::uuid
      AND (role_id IS DISTINCT FROM '477bd57d-b848-4c5f-abff-e4e903065b72'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '871875a1-9119-4571-9fa7-b4f3584c461c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Thompson
    -- ID: 74300bfc-f538-42dd-aef4-722e4f97f3ff
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '74300bfc-f538-42dd-aef4-722e4f97f3ff'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Monica Flores
    -- ID: 74330a06-422a-4d6b-b565-5c96edf748f6
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '74330a06-422a-4d6b-b565-5c96edf748f6'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Rodriguez
    -- ID: 744a6287-b437-4b31-bb04-6eea31d5df04
    UPDATE public.personas
    SET
        role_id = '1f1fd08d-2f4e-4121-b480-a3e74a174fca'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = '744a6287-b437-4b31-bb04-6eea31d5df04'::uuid
      AND (role_id IS DISTINCT FROM '1f1fd08d-2f4e-4121-b480-a3e74a174fca'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda Lee
    -- ID: 747843af-1215-4cc2-bf36-7c834fb40ad3
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '747843af-1215-4cc2-bf36-7c834fb40ad3'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Rodriguez
    -- ID: 75b7d366-ad15-45cc-ae9b-c916b8303474
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '75b7d366-ad15-45cc-ae9b-c916b8303474'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Kim
    -- ID: 75e7b381-8f88-4ebb-bfb6-65b2e5913d03
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '75e7b381-8f88-4ebb-bfb6-65b2e5913d03'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Thompson
    -- ID: 766d17bb-e90d-409a-b7ab-ce8d5b73883a
    UPDATE public.personas
    SET
        role_id = '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '766d17bb-e90d-409a-b7ab-ce8d5b73883a'::uuid
      AND (role_id IS DISTINCT FROM '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jessica Martinez
    -- ID: 76c74f06-a7b6-467e-8c82-4c0e9043f6b3
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '76c74f06-a7b6-467e-8c82-4c0e9043f6b3'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rachel Lewis
    -- ID: 76f3347b-2367-4710-9366-444b3c3119e7
    UPDATE public.personas
    SET
        role_id = 'c6f91d15-8a63-4140-928b-bd82b39dd33d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = '76f3347b-2367-4710-9366-444b3c3119e7'::uuid
      AND (role_id IS DISTINCT FROM 'c6f91d15-8a63-4140-928b-bd82b39dd33d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew Moore
    -- ID: 77acf705-2f9a-4f8b-9c7c-a98d0cb10081
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '77acf705-2f9a-4f8b-9c7c-a98d0cb10081'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Park
    -- ID: 783ab3f8-30f6-47cb-a498-b8d6bd9e39d3
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '783ab3f8-30f6-47cb-a498-b8d6bd9e39d3'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Kevin Brown
    -- ID: 7854d404-8398-499b-a98d-e66c65c103ef
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '7854d404-8398-499b-a98d-e66c65c103ef'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jessica Brown
    -- ID: 7890d55d-59d8-4560-bfe3-8266d3d2ef6b
    UPDATE public.personas
    SET
        role_id = 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '7890d55d-59d8-4560-bfe3-8266d3d2ef6b'::uuid
      AND (role_id IS DISTINCT FROM 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Davis
    -- ID: 7951e99f-0e36-489b-801c-4f59ceb993e7
    UPDATE public.personas
    SET
        role_id = '8d6ca186-f70a-4a13-a7b3-e32abb59f80b'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '7951e99f-0e36-489b-801c-4f59ceb993e7'::uuid
      AND (role_id IS DISTINCT FROM '8d6ca186-f70a-4a13-a7b3-e32abb59f80b'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Brown
    -- ID: 7aa849f3-2412-4407-a0bf-3454aee585ff
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '7aa849f3-2412-4407-a0bf-3454aee585ff'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Rodriguez
    -- ID: 7ac33bb5-9fd6-4a5c-ba76-5232dff70395
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '7ac33bb5-9fd6-4a5c-ba76-5232dff70395'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew Hall
    -- ID: 7ad86d80-2001-4a8d-a6af-498b424e5660
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '7ad86d80-2001-4a8d-a6af-498b424e5660'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Rodriguez
    -- ID: 7af8dd7e-c7ed-4b0c-ac26-082372365c4a
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '7af8dd7e-c7ed-4b0c-ac26-082372365c4a'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Thompson
    -- ID: 7b188203-8206-4f05-8d01-583c79f5d3be
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = '7b188203-8206-4f05-8d01-583c79f5d3be'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Thomas Anderson
    -- ID: 7b21c330-6775-415e-b3aa-7c36c7e3561e
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '7b21c330-6775-415e-b3aa-7c36c7e3561e'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Kim
    -- ID: 7b5e6d1f-8563-41e8-a5d7-6e469f2a1138
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = '7b5e6d1f-8563-41e8-a5d7-6e469f2a1138'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Andrew Harris
    -- ID: 7b9c8f3c-b905-4b94-a110-97048936cbc1
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '7b9c8f3c-b905-4b94-a110-97048936cbc1'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Thompson
    -- ID: 7b9cc856-d182-4c2e-aff6-c25bbc98d9b4
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '7b9cc856-d182-4c2e-aff6-c25bbc98d9b4'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Hernandez
    -- ID: 7bd550ff-45e4-4f04-8474-9c3a0204e61a
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '7bd550ff-45e4-4f04-8474-9c3a0204e61a'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Yuki Sakura
    -- ID: 7c969b7f-4166-4220-bb07-4d22447d83b1
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '7c969b7f-4166-4220-bb07-4d22447d83b1'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Lee
    -- ID: 7ca8f9a9-98cc-4e3a-8f96-5617703dd3e4
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '7ca8f9a9-98cc-4e3a-8f96-5617703dd3e4'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Lee
    -- ID: 7d207317-3ced-4971-aeac-8a3108291de9
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '7d207317-3ced-4971-aeac-8a3108291de9'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Daniel Walker
    -- ID: 7d951b06-c76d-4db9-b04e-d408c3a2cbc8
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '7d951b06-c76d-4db9-b04e-d408c3a2cbc8'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Yuki Tanaka
    -- ID: 7ea5cdef-92e4-49b6-ae92-bfbb2e832c65
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = '7ea5cdef-92e4-49b6-ae92-bfbb2e832c65'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Anderson
    -- ID: 7f23c9be-6368-4854-bd5f-437b369dbdbd
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '7f23c9be-6368-4854-bd5f-437b369dbdbd'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Yuki Sakura
    -- ID: 806a1e03-d310-4924-aefa-6cf0b1f3b97a
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '806a1e03-d310-4924-aefa-6cf0b1f3b97a'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Garcia
    -- ID: 806c7c9a-a02a-4f5b-a7b6-8406fc694354
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '806c7c9a-a02a-4f5b-a7b6-8406fc694354'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Aisha Okonkwo
    -- ID: 80b15038-5fcb-471e-b7ff-001494624c34
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '80b15038-5fcb-471e-b7ff-001494624c34'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Johnson
    -- ID: 80e3d797-5a08-4835-9c10-ed2362d17316
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '80e3d797-5a08-4835-9c10-ed2362d17316'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Mark Thompson
    -- ID: 814e5530-c9da-4bf3-b47b-0fb0707fe940
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '814e5530-c9da-4bf3-b47b-0fb0707fe940'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Monica Flores
    -- ID: 8178d368-18cd-49f3-9047-872e8d0323b3
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '8178d368-18cd-49f3-9047-872e8d0323b3'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Martinez
    -- ID: 8195204c-6c0d-4e05-9bdc-3b476603bbf8
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '8195204c-6c0d-4e05-9bdc-3b476603bbf8'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Davis
    -- ID: 83b809d5-1265-40e5-90bc-f3dd82cfea8a
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '83b809d5-1265-40e5-90bc-f3dd82cfea8a'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Wilson
    -- ID: 8412b4e0-314b-4c23-9c8d-09d33ccc53c0
    UPDATE public.personas
    SET
        role_id = '7ac3598c-e21d-4aca-9db7-f152f6d99faf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '8412b4e0-314b-4c23-9c8d-09d33ccc53c0'::uuid
      AND (role_id IS DISTINCT FROM '7ac3598c-e21d-4aca-9db7-f152f6d99faf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Martinez
    -- ID: 848d3f15-ce27-401c-80f8-f9db41f4c35b
    UPDATE public.personas
    SET
        role_id = '309657e3-357d-4ee7-b903-1bdd6d59e64d'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = '848d3f15-ce27-401c-80f8-f9db41f4c35b'::uuid
      AND (role_id IS DISTINCT FROM '309657e3-357d-4ee7-b903-1bdd6d59e64d'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Daniel Walker
    -- ID: 84d3a14c-410d-498d-974d-9ae8f49d85ab
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '84d3a14c-410d-498d-974d-9ae8f49d85ab'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Martinez
    -- ID: 84dca4a3-f188-4ec0-8ca8-57f0985c07fd
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '84dca4a3-f188-4ec0-8ca8-57f0985c07fd'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Daniel Rodriguez
    -- ID: 85e274a0-dfc0-4436-bf2a-e35aca8b1feb
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '85e274a0-dfc0-4436-bf2a-e35aca8b1feb'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Martinez
    -- ID: 864e1453-89e4-4d07-bc18-56b30f8a6be2
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '864e1453-89e4-4d07-bc18-56b30f8a6be2'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Thompson
    -- ID: 86ee26fa-a72f-41a2-ad7d-16de692896f6
    UPDATE public.personas
    SET
        role_id = '6b96b2e8-3e09-4785-861f-95878eb47e7e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid,
        updated_at = NOW()
    WHERE id = '86ee26fa-a72f-41a2-ad7d-16de692896f6'::uuid
      AND (role_id IS DISTINCT FROM '6b96b2e8-3e09-4785-861f-95878eb47e7e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda Wilson
    -- ID: 8738c01a-33e9-435a-b9a0-d972c1a5c6c8
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '8738c01a-33e9-435a-b9a0-d972c1a5c6c8'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Martinez
    -- ID: 876817ef-4f58-4e42-85c0-0b5021479398
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '876817ef-4f58-4e42-85c0-0b5021479398'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Catherine Lefevre
    -- ID: 87d62702-96b2-4d3e-9290-279170c0e1a5
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '87d62702-96b2-4d3e-9290-279170c0e1a5'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Johnson
    -- ID: 87ef556f-a33c-401a-b800-ef3429c2cb01
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '87ef556f-a33c-401a-b800-ef3429c2cb01'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew Lee
    -- ID: 88c1c8c5-ba68-4bca-94fd-b7d43e655865
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '88c1c8c5-ba68-4bca-94fd-b7d43e655865'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Thompson
    -- ID: 88d779cb-c273-42ef-b8b5-34bbb7e87b0e
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '88d779cb-c273-42ef-b8b5-34bbb7e87b0e'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: MEDICAL AFFAIRS DIRECTOR
    -- ID: 89e0b8fc-5a31-46b2-8872-cf34272e166b
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '89e0b8fc-5a31-46b2-8872-cf34272e166b'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jessica Martinez
    -- ID: 8a270a12-8dd6-4128-afa7-6f601b198f78
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '8a270a12-8dd6-4128-afa7-6f601b198f78'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Hill
    -- ID: 8a3b76c5-01df-47a7-b11e-4c18ca01e982
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '8a3b76c5-01df-47a7-b11e-4c18ca01e982'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Brown
    -- ID: 8a4c5fe3-1cd7-45cd-8af9-84b5c73daa92
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '8a4c5fe3-1cd7-45cd-8af9-84b5c73daa92'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Wright
    -- ID: 8a68da08-a0f4-4b96-bb37-9aed59a8e200
    UPDATE public.personas
    SET
        role_id = '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid,
        updated_at = NOW()
    WHERE id = '8a68da08-a0f4-4b96-bb37-9aed59a8e200'::uuid
      AND (role_id IS DISTINCT FROM '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Medical Science Liaison
    -- ID: 8a9897fa-462b-4f93-a56b-4b64aa19e8cd
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '8a9897fa-462b-4f93-a56b-4b64aa19e8cd'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Davis
    -- ID: 8ac8857f-22b7-43b6-b865-6185ab9004ba
    UPDATE public.personas
    SET
        role_id = '59f6174c-cd72-462b-830c-235bb20099ac'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid,
        updated_at = NOW()
    WHERE id = '8ac8857f-22b7-43b6-b865-6185ab9004ba'::uuid
      AND (role_id IS DISTINCT FROM '59f6174c-cd72-462b-830c-235bb20099ac'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Matthew Rodriguez
    -- ID: 8b4da8b6-0c5b-4f57-9c00-035b5a271eff
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '8b4da8b6-0c5b-4f57-9c00-035b5a271eff'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Lee
    -- ID: 8b7a110a-b35f-4212-bbde-74d1c22b3504
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '8b7a110a-b35f-4212-bbde-74d1c22b3504'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Rodriguez
    -- ID: 8c561df5-d89e-4840-9a2e-6726682bf2d8
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '8c561df5-d89e-4840-9a2e-6726682bf2d8'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Hassan Al-Rashid
    -- ID: 8c92d860-dce2-410f-861e-30d63ef50ad3
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '8c92d860-dce2-410f-861e-30d63ef50ad3'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Martinez
    -- ID: 8cbc41a0-0782-43fe-a1cd-3e525711e45e
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '8cbc41a0-0782-43fe-a1cd-3e525711e45e'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Marco Bellini
    -- ID: 8cc79c61-c324-4f3d-af65-32c7348fc671
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '8cc79c61-c324-4f3d-af65-32c7348fc671'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Lee
    -- ID: 8ccba24a-801c-4887-b2b7-53fad994e50d
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '8ccba24a-801c-4887-b2b7-53fad994e50d'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew Wright
    -- ID: 8d20ce87-0e8e-4f09-bb34-bee896a4bc9b
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = '8d20ce87-0e8e-4f09-bb34-bee896a4bc9b'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sofia Nkembe
    -- ID: 8d7cf5ad-857b-49ba-a5eb-dbaca855bb4c
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '8d7cf5ad-857b-49ba-a5eb-dbaca855bb4c'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Daniel Martinez
    -- ID: 8e003fa9-5ede-4e59-bff8-5a9cc3e8750a
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = '8e003fa9-5ede-4e59-bff8-5a9cc3e8750a'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Marcus Davis
    -- ID: 8e66fee2-3bbb-41df-86aa-4f77a7a74202
    UPDATE public.personas
    SET
        role_id = '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '8e66fee2-3bbb-41df-86aa-4f77a7a74202'::uuid
      AND (role_id IS DISTINCT FROM '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Davis
    -- ID: 8f09dae4-15bc-4a16-b9bc-3f6720706c06
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '8f09dae4-15bc-4a16-b9bc-3f6720706c06'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Rebecca Martinez
    -- ID: 8f134ef8-4056-417c-b167-a4ab801097ba
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = '8f134ef8-4056-417c-b167-a4ab801097ba'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lisa Anderson
    -- ID: 8f44884b-c117-4fd9-bcc7-84a3e2f2fc83
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = '8f44884b-c117-4fd9-bcc7-84a3e2f2fc83'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Hill
    -- ID: 90921478-fb3a-459a-8ff5-ab7d0283fda5
    UPDATE public.personas
    SET
        role_id = '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid,
        updated_at = NOW()
    WHERE id = '90921478-fb3a-459a-8ff5-ab7d0283fda5'::uuid
      AND (role_id IS DISTINCT FROM '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Garcia
    -- ID: 90b30694-5a4f-4f21-87e1-f322b69865dc
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '90b30694-5a4f-4f21-87e1-f322b69865dc'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Lopez
    -- ID: 914f760f-d01e-471d-bcad-07fe0c79f917
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '914f760f-d01e-471d-bcad-07fe0c79f917'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Maria Rodriguez
    -- ID: 91532e5c-1b4f-4f17-9e1d-86930660a6cd
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '91532e5c-1b4f-4f17-9e1d-86930660a6cd'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Harris
    -- ID: 91c6b72a-c3ed-4f8f-95af-99e470cbca51
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '91c6b72a-c3ed-4f8f-95af-99e470cbca51'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jessica White
    -- ID: 91ec09ba-f70f-4cd4-9cc8-3d7f0bf81d20
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '91ec09ba-f70f-4cd4-9cc8-3d7f0bf81d20'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Rodriguez
    -- ID: 92669815-dbdd-4fff-b1fa-ef7cfb030711
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '92669815-dbdd-4fff-b1fa-ef7cfb030711'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Wilson
    -- ID: 926fff48-649e-4a64-a17c-a0e0338e04d3
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '926fff48-649e-4a64-a17c-a0e0338e04d3'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Davis
    -- ID: 931ccd95-6598-4c20-96da-0c0de2e14ec3
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '931ccd95-6598-4c20-96da-0c0de2e14ec3'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Hassan Al-Rashid
    -- ID: 932f2d8a-617f-4b84-9827-48717e8aad81
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '932f2d8a-617f-4b84-9827-48717e8aad81'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jessica Martinez
    -- ID: 939a37f3-dae1-44a5-ba4c-8c38d94fe964
    UPDATE public.personas
    SET
        role_id = '2127d5cf-f94c-4456-a0c7-015c502e27bc'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid,
        updated_at = NOW()
    WHERE id = '939a37f3-dae1-44a5-ba4c-8c38d94fe964'::uuid
      AND (role_id IS DISTINCT FROM '2127d5cf-f94c-4456-a0c7-015c502e27bc'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Rodriguez
    -- ID: 93d7fb3d-241a-4327-a68a-aa4c9e7d414d
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '93d7fb3d-241a-4327-a68a-aa4c9e7d414d'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elizabeth Brown
    -- ID: 942bed85-8419-4b5d-9a8d-3d88beea2529
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '942bed85-8419-4b5d-9a8d-3d88beea2529'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Thompson
    -- ID: 947d19c6-6dff-4bd4-b6c9-e1efedb55f9f
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '947d19c6-6dff-4bd4-b6c9-e1efedb55f9f'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Anderson
    -- ID: 953724b9-5698-4b9a-9615-ae360e303e35
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '953724b9-5698-4b9a-9615-ae360e303e35'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Thompson
    -- ID: 9541b3c1-3dbb-4569-8fb8-6f2f92f79cee
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '9541b3c1-3dbb-4569-8fb8-6f2f92f79cee'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Roberto Alvarez
    -- ID: 956575c3-eda4-4dac-b689-d49653f97339
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '956575c3-eda4-4dac-b689-d49653f97339'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Wilson
    -- ID: 964a9315-758f-41f5-86c9-ead3747e0603
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '964a9315-758f-41f5-86c9-ead3747e0603'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Kim
    -- ID: 96715508-0be8-4e48-b410-35a097499512
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '96715508-0be8-4e48-b410-35a097499512'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jessica Lopez
    -- ID: 96eb1592-0faa-41e2-a0a5-6f5d573c5cac
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '96eb1592-0faa-41e2-a0a5-6f5d573c5cac'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Daniel Thompson
    -- ID: 9746ffd3-da7e-4b36-9a57-0487e4754200
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '9746ffd3-da7e-4b36-9a57-0487e4754200'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Wilson
    -- ID: 97ac27b7-8e2b-47c3-ba6b-b60ed07efd31
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '97ac27b7-8e2b-47c3-ba6b-b60ed07efd31'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Davis
    -- ID: 97cf678f-5ee7-45f6-8e46-8cdbfe437778
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '97cf678f-5ee7-45f6-8e46-8cdbfe437778'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Patterson
    -- ID: 9804c7de-2638-4f04-b0ef-195d9c5cb988
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '9804c7de-2638-4f04-b0ef-195d9c5cb988'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Lopez
    -- ID: 980974a4-0721-433e-af06-d4a472997116
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '980974a4-0721-433e-af06-d4a472997116'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Lee
    -- ID: 9831eb5c-b740-425f-9dfb-1fe444f74405
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '9831eb5c-b740-425f-9dfb-1fe444f74405'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Wilson
    -- ID: 98658b2f-c533-45fe-b5a9-595f2813f37f
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '98658b2f-c533-45fe-b5a9-595f2813f37f'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Maria Gonzalez
    -- ID: 989cbb17-5d26-403c-9209-82e9d4dcb477
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '989cbb17-5d26-403c-9209-82e9d4dcb477'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Williams
    -- ID: 9917249d-4e54-4e57-bcfd-c5d9f265981e
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '9917249d-4e54-4e57-bcfd-c5d9f265981e'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michelle Davis
    -- ID: 9938d240-021e-4098-8b8b-62b0005757cd
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = '9938d240-021e-4098-8b8b-62b0005757cd'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David White
    -- ID: 99a0f759-8083-4b43-b150-27e06df3fbb9
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = '99a0f759-8083-4b43-b150-27e06df3fbb9'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rachel Taylor
    -- ID: 99ad4696-6b24-4f7a-957d-cfec51d047fc
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '99ad4696-6b24-4f7a-957d-cfec51d047fc'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Nicole Martinez
    -- ID: 99b48307-1a18-4a90-bd1d-09fc6efc0238
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '99b48307-1a18-4a90-bd1d-09fc6efc0238'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Martin
    -- ID: 99ce3755-42af-452e-b9c9-c5c638754e6b
    UPDATE public.personas
    SET
        role_id = '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid,
        updated_at = NOW()
    WHERE id = '99ce3755-42af-452e-b9c9-c5c638754e6b'::uuid
      AND (role_id IS DISTINCT FROM '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Martinez
    -- ID: 99d05d35-a3ba-4f76-b9ec-ce5aaf4cdc28
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '99d05d35-a3ba-4f76-b9ec-ce5aaf4cdc28'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Wilson
    -- ID: 9b5d5c9f-ac89-432d-b3e4-b1cafb1f2c3b
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '9b5d5c9f-ac89-432d-b3e4-b1cafb1f2c3b'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Martinez
    -- ID: 9b9e3b99-7786-4755-9150-dc41f24e6446
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = '9b9e3b99-7786-4755-9150-dc41f24e6446'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: William Young
    -- ID: 9c2357d6-9ab8-45c3-8926-c8b4037b4223
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '9c2357d6-9ab8-45c3-8926-c8b4037b4223'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Davis
    -- ID: 9c2f3769-275b-44c3-bdb1-c6edd596dd46
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '9c2f3769-275b-44c3-bdb1-c6edd596dd46'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sophie Bernard
    -- ID: 9c48a4cb-890a-477e-b3e2-29d91883e19b
    UPDATE public.personas
    SET
        role_id = '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '9c48a4cb-890a-477e-b3e2-29d91883e19b'::uuid
      AND (role_id IS DISTINCT FROM '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael O''Brien
    -- ID: 9c76c421-1b0a-4dd1-8120-c71650851628
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = '9c76c421-1b0a-4dd1-8120-c71650851628'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jessica Lee
    -- ID: 9c77370d-d967-4eaf-a6bb-eac1ea91d039
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = '9c77370d-d967-4eaf-a6bb-eac1ea91d039'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert King
    -- ID: 9c8a4620-721a-40fa-8300-cd69d1abe27d
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '9c8a4620-721a-40fa-8300-cd69d1abe27d'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer White
    -- ID: 9cad37d0-ccfc-40a0-b751-3e96abac1d03
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = '9cad37d0-ccfc-40a0-b751-3e96abac1d03'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Thompson
    -- ID: 9d0a0670-a838-4b34-8a5c-cc44885a2b63
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = '9d0a0670-a838-4b34-8a5c-cc44885a2b63'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Daniel Chen
    -- ID: 9d7bea8d-a30f-4747-bc18-fd07589ee416
    UPDATE public.personas
    SET
        role_id = '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = '9d7bea8d-a30f-4747-bc18-fd07589ee416'::uuid
      AND (role_id IS DISTINCT FROM '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Martinez
    -- ID: 9dcbcaf5-b815-45fd-a95b-5dd6eaaff86c
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '9dcbcaf5-b815-45fd-a95b-5dd6eaaff86c'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Martinez
    -- ID: 9ee4cb98-eb66-496b-9c6f-197861e821ae
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = '9ee4cb98-eb66-496b-9c6f-197861e821ae'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Chen
    -- ID: 9f888af8-a1f8-4606-b3bf-0cb58d085104
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = '9f888af8-a1f8-4606-b3bf-0cb58d085104'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Daniel Jackson
    -- ID: 9fb95565-0891-4ede-95a8-bf21bd62bfc3
    UPDATE public.personas
    SET
        role_id = '6b96b2e8-3e09-4785-861f-95878eb47e7e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid,
        updated_at = NOW()
    WHERE id = '9fb95565-0891-4ede-95a8-bf21bd62bfc3'::uuid
      AND (role_id IS DISTINCT FROM '6b96b2e8-3e09-4785-861f-95878eb47e7e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Park
    -- ID: a053b653-db5a-4857-aa20-c860ca5754d9
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'a053b653-db5a-4857-aa20-c860ca5754d9'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emma Rodriguez
    -- ID: a122e9bc-c5b7-49f0-8e6c-890e3f120136
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'a122e9bc-c5b7-49f0-8e6c-890e3f120136'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Garcia
    -- ID: a1a8162f-45a1-480c-8809-4b14a03ec463
    UPDATE public.personas
    SET
        role_id = 'c7f0c3ae-7ac4-4f97-aacf-9c5896e32dd6'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a1a8162f-45a1-480c-8809-4b14a03ec463'::uuid
      AND (role_id IS DISTINCT FROM 'c7f0c3ae-7ac4-4f97-aacf-9c5896e32dd6'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Wilson
    -- ID: a1c64fef-2154-404f-8fe9-a467752c9b6c
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = 'a1c64fef-2154-404f-8fe9-a467752c9b6c'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew Walker
    -- ID: a1d78b1e-ed27-4ff0-badf-015f76a091d2
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = 'a1d78b1e-ed27-4ff0-badf-015f76a091d2'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Moore
    -- ID: a1fc8981-6abc-438a-80ad-ab9ed61c8c7b
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a1fc8981-6abc-438a-80ad-ab9ed61c8c7b'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Marcus Johnson
    -- ID: a29fd544-b130-49a6-b23a-7b0d587eba5a
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a29fd544-b130-49a6-b23a-7b0d587eba5a'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Park
    -- ID: a3060e2d-004c-46a5-a974-2b509ffbb431
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'a3060e2d-004c-46a5-a974-2b509ffbb431'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Brown
    -- ID: a30fc571-6298-4a29-a89a-dae3f49e2e68
    UPDATE public.personas
    SET
        role_id = 'c7f0c3ae-7ac4-4f97-aacf-9c5896e32dd6'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a30fc571-6298-4a29-a89a-dae3f49e2e68'::uuid
      AND (role_id IS DISTINCT FROM 'c7f0c3ae-7ac4-4f97-aacf-9c5896e32dd6'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Wilson
    -- ID: a31fef83-6494-4e6a-912e-c954dca854ff
    UPDATE public.personas
    SET
        role_id = '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid,
        updated_at = NOW()
    WHERE id = 'a31fef83-6494-4e6a-912e-c954dca854ff'::uuid
      AND (role_id IS DISTINCT FROM '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Peterson
    -- ID: a3927cb5-48f9-47d2-a11b-5ddcb9cd301b
    UPDATE public.personas
    SET
        role_id = '59f6174c-cd72-462b-830c-235bb20099ac'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid,
        updated_at = NOW()
    WHERE id = 'a3927cb5-48f9-47d2-a11b-5ddcb9cd301b'::uuid
      AND (role_id IS DISTINCT FROM '59f6174c-cd72-462b-830c-235bb20099ac'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Jones
    -- ID: a47467df-0e56-4313-a64b-341d4c73aab0
    UPDATE public.personas
    SET
        role_id = '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'a47467df-0e56-4313-a64b-341d4c73aab0'::uuid
      AND (role_id IS DISTINCT FROM '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jessica Robinson
    -- ID: a4de71b5-5999-4678-92e2-4ff23f10f406
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'a4de71b5-5999-4678-92e2-4ff23f10f406'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Nicole Lewis
    -- ID: a537635b-5a84-4367-8b86-3891d71f9bb0
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'a537635b-5a84-4367-8b86-3891d71f9bb0'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Martinez
    -- ID: a53bcbd4-3c37-4e24-8251-7d78acad015a
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a53bcbd4-3c37-4e24-8251-7d78acad015a'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sophie Moreau
    -- ID: a551a858-ac6d-4c12-91b3-60d1e76f053a
    UPDATE public.personas
    SET
        role_id = '1cd1953d-301e-4ad7-995c-6137fa319ada'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid,
        updated_at = NOW()
    WHERE id = 'a551a858-ac6d-4c12-91b3-60d1e76f053a'::uuid
      AND (role_id IS DISTINCT FROM '1cd1953d-301e-4ad7-995c-6137fa319ada'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lisa Clark
    -- ID: a5bf4154-d42b-4de2-9e92-02566752d9a9
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'a5bf4154-d42b-4de2-9e92-02566752d9a9'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Martinez
    -- ID: a5c74ce5-5017-435a-8cf6-10c400dcd16b
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a5c74ce5-5017-435a-8cf6-10c400dcd16b'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew King
    -- ID: a61e61e8-435d-439a-9550-ae67f852a1d9
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'a61e61e8-435d-439a-9550-ae67f852a1d9'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lisa Jackson
    -- ID: a64a881c-05fe-4ed0-81c5-19ef6d40f41d
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'a64a881c-05fe-4ed0-81c5-19ef6d40f41d'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Brown
    -- ID: a6d5723d-ae71-486d-8d33-06e9576221fd
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a6d5723d-ae71-486d-8d33-06e9576221fd'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Rodriguez
    -- ID: a70938c9-463d-48fd-88d2-228490ec5a74
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'a70938c9-463d-48fd-88d2-228490ec5a74'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle King
    -- ID: a74121fa-c9ed-4dc0-a94f-7dbd6be685b6
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'a74121fa-c9ed-4dc0-a94f-7dbd6be685b6'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Wilson
    -- ID: a7a21213-17d0-44c6-aff3-83e737e3c31c
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = 'a7a21213-17d0-44c6-aff3-83e737e3c31c'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Hall
    -- ID: a814e55f-cbb7-4f69-b561-0177a86fd807
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a814e55f-cbb7-4f69-b561-0177a86fd807'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Lee
    -- ID: a823427a-f05a-4df8-bff9-7384a7c7a954
    UPDATE public.personas
    SET
        role_id = 'c7f0c3ae-7ac4-4f97-aacf-9c5896e32dd6'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a823427a-f05a-4df8-bff9-7384a7c7a954'::uuid
      AND (role_id IS DISTINCT FROM 'c7f0c3ae-7ac4-4f97-aacf-9c5896e32dd6'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Maya Patel
    -- ID: a826591b-bc62-4dc8-b113-ae43d4ea357e
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a826591b-bc62-4dc8-b113-ae43d4ea357e'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Anderson
    -- ID: a836f27c-7bb9-4895-861c-dce4b089798d
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a836f27c-7bb9-4895-861c-dce4b089798d'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Taylor
    -- ID: a892e940-f625-4ec1-aaec-8e72f4e440c7
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'a892e940-f625-4ec1-aaec-8e72f4e440c7'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Catherine Lefevre
    -- ID: a8cfe505-8cde-4305-bc28-412b3f0223d5
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = 'a8cfe505-8cde-4305-bc28-412b3f0223d5'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Adams
    -- ID: a99120c0-7a3d-4a89-aab8-02646587799b
    UPDATE public.personas
    SET
        role_id = '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid,
        updated_at = NOW()
    WHERE id = 'a99120c0-7a3d-4a89-aab8-02646587799b'::uuid
      AND (role_id IS DISTINCT FROM '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Daniel Rodriguez
    -- ID: a9953e7c-086e-4958-9b7d-3849ae9b1766
    UPDATE public.personas
    SET
        role_id = '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid,
        updated_at = NOW()
    WHERE id = 'a9953e7c-086e-4958-9b7d-3849ae9b1766'::uuid
      AND (role_id IS DISTINCT FROM '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elena Kovalenko
    -- ID: a9d39692-7e9e-44c3-b1aa-07d489d77287
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'a9d39692-7e9e-44c3-b1aa-07d489d77287'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amy Zhang
    -- ID: aad2577a-f161-4b24-9f62-0dc638aff8d7
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'aad2577a-f161-4b24-9f62-0dc638aff8d7'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Davis
    -- ID: ab47bdfe-9562-4ead-bcbb-f2a7aa476c08
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'ab47bdfe-9562-4ead-bcbb-f2a7aa476c08'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Andrew Thompson
    -- ID: ab78eaa5-4ac3-4a92-a0ae-0d71836bb999
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'ab78eaa5-4ac3-4a92-a0ae-0d71836bb999'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda White
    -- ID: ab9b2c5c-ab75-42ec-96e2-f1695ca9e5f0
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'ab9b2c5c-ab75-42ec-96e2-f1695ca9e5f0'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Davis
    -- ID: ac655f85-c52b-4f3c-8f0c-5de964973650
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'ac655f85-c52b-4f3c-8f0c-5de964973650'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Ryan O''Connor
    -- ID: ac8526ec-1ab4-42cd-a515-a2eccd394ea9
    UPDATE public.personas
    SET
        role_id = '2127d5cf-f94c-4456-a0c7-015c502e27bc'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid,
        updated_at = NOW()
    WHERE id = 'ac8526ec-1ab4-42cd-a515-a2eccd394ea9'::uuid
      AND (role_id IS DISTINCT FROM '2127d5cf-f94c-4456-a0c7-015c502e27bc'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Thompson
    -- ID: aca4fdd5-9f67-4a55-aff4-0ef93d92bcce
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'aca4fdd5-9f67-4a55-aff4-0ef93d92bcce'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lisa Park
    -- ID: ad4f4277-5dbd-44d0-8f3b-fe4446bbc690
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'ad4f4277-5dbd-44d0-8f3b-fe4446bbc690'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Davis
    -- ID: ad6b3eab-6f0c-41a8-8bd5-198fbcb13c54
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'ad6b3eab-6f0c-41a8-8bd5-198fbcb13c54'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lisa Garcia
    -- ID: ade5fe38-4a56-4155-8f99-4ae1070ee2d2
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'ade5fe38-4a56-4155-8f99-4ae1070ee2d2'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Priya Kapoor
    -- ID: ae04fcb4-b367-44df-aa4f-32ca10a09f67
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'ae04fcb4-b367-44df-aa4f-32ca10a09f67'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Garcia
    -- ID: ae9268fa-21c7-4f18-b288-03c1f6bae7e4
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = 'ae9268fa-21c7-4f18-b288-03c1f6bae7e4'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Margaret Liu
    -- ID: ae99d779-df10-48e0-bf60-0dcb16dd8b7b
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'ae99d779-df10-48e0-bf60-0dcb16dd8b7b'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Julien Fischer
    -- ID: aed8d1b8-38f5-4d3c-80bb-dd4bbd3f4705
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = 'aed8d1b8-38f5-4d3c-80bb-dd4bbd3f4705'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Hall
    -- ID: aedb0a44-88fb-4015-9c61-c5442c876201
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'aedb0a44-88fb-4015-9c61-c5442c876201'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Garcia
    -- ID: b015a7ce-bec6-45ab-b557-ac93e48d83f1
    UPDATE public.personas
    SET
        role_id = '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'b015a7ce-bec6-45ab-b557-ac93e48d83f1'::uuid
      AND (role_id IS DISTINCT FROM '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Anderson
    -- ID: b0354858-4fe6-4336-aa15-0613e2be2f8c
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'b0354858-4fe6-4336-aa15-0613e2be2f8c'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Lopez
    -- ID: b1d1bf97-a1e3-43ab-b399-ec912ab977bd
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'b1d1bf97-a1e3-43ab-b399-ec912ab977bd'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elena Rodriguez
    -- ID: b1d98143-95dc-4108-9a74-dd8c7019ee94
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'b1d98143-95dc-4108-9a74-dd8c7019ee94'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Harris
    -- ID: b1f0fe18-73de-4c9a-86d3-10ede4e9a7bf
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'b1f0fe18-73de-4c9a-86d3-10ede4e9a7bf'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Wilson
    -- ID: b2132d16-4d20-48c6-b1d0-33e06ab82a03
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'b2132d16-4d20-48c6-b1d0-33e06ab82a03'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily White
    -- ID: b264cd77-10b7-496f-af0e-1c010bc60a7c
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'b264cd77-10b7-496f-af0e-1c010bc60a7c'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Andrew Taylor
    -- ID: b3e49af4-0c71-4aa3-b72f-350da8cac829
    UPDATE public.personas
    SET
        role_id = '240e8b25-3ba8-47ad-bdc6-1a7344d2dae7'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'b3e49af4-0c71-4aa3-b72f-350da8cac829'::uuid
      AND (role_id IS DISTINCT FROM '240e8b25-3ba8-47ad-bdc6-1a7344d2dae7'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Martinez
    -- ID: b50766b1-c8f9-4a1c-85ab-a88a964771fc
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'b50766b1-c8f9-4a1c-85ab-a88a964771fc'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Victoria Thompson
    -- ID: b556674b-6e29-4df4-877c-7dddfdf257ac
    UPDATE public.personas
    SET
        role_id = '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid,
        updated_at = NOW()
    WHERE id = 'b556674b-6e29-4df4-877c-7dddfdf257ac'::uuid
      AND (role_id IS DISTINCT FROM '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Andrew Wilson
    -- ID: b5bd1f66-7c80-4ac8-8187-d63826a4cc4a
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'b5bd1f66-7c80-4ac8-8187-d63826a4cc4a'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Wilson
    -- ID: b5f6ffc6-0b86-44e4-b9b2-f2fc2aab9069
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'b5f6ffc6-0b86-44e4-b9b2-f2fc2aab9069'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Chen
    -- ID: b681372f-6f3d-4fc3-b765-db0e87cf0865
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'b681372f-6f3d-4fc3-b765-db0e87cf0865'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Brown
    -- ID: b6a8e4f1-b076-47cb-b31d-b679e4d4448e
    UPDATE public.personas
    SET
        role_id = '59f6174c-cd72-462b-830c-235bb20099ac'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid,
        updated_at = NOW()
    WHERE id = 'b6a8e4f1-b076-47cb-b31d-b679e4d4448e'::uuid
      AND (role_id IS DISTINCT FROM '59f6174c-cd72-462b-830c-235bb20099ac'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Martin
    -- ID: b714488f-e1fe-4226-8e85-e8e84d00f2ac
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'b714488f-e1fe-4226-8e85-e8e84d00f2ac'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Wilson
    -- ID: b741ee31-79b1-4b6c-ae4c-4b21ee95a94f
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'b741ee31-79b1-4b6c-ae4c-4b21ee95a94f'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda White
    -- ID: b7681a82-02e4-4ae8-ae96-e49fba2d1dc5
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'b7681a82-02e4-4ae8-ae96-e49fba2d1dc5'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Martinez
    -- ID: b7e025a0-d2ff-4ca6-852a-bb3140f48b10
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'b7e025a0-d2ff-4ca6-852a-bb3140f48b10'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jessica Martinez
    -- ID: b7e7e845-cc5b-4e3a-a03f-73f632386a6a
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'b7e7e845-cc5b-4e3a-a03f-73f632386a6a'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Wilson
    -- ID: b855c4c1-3e7c-4eb9-bbcb-b0595f2f5782
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'b855c4c1-3e7c-4eb9-bbcb-b0595f2f5782'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Miller
    -- ID: b87f2a3f-8555-4491-a80a-8412987e9579
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'b87f2a3f-8555-4491-a80a-8412987e9579'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Chen
    -- ID: b88ca040-089a-477a-a048-a421b988030d
    UPDATE public.personas
    SET
        role_id = '8f06ad67-dd82-4b91-b614-05fb513a966d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid,
        updated_at = NOW()
    WHERE id = 'b88ca040-089a-477a-a048-a421b988030d'::uuid
      AND (role_id IS DISTINCT FROM '8f06ad67-dd82-4b91-b614-05fb513a966d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Lopez
    -- ID: b89e9a65-5fec-4e34-9d3e-6b75d6f044ff
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'b89e9a65-5fec-4e34-9d3e-6b75d6f044ff'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Yuki Sakura
    -- ID: b8c69a26-942f-4e73-81b4-831edc03823d
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'b8c69a26-942f-4e73-81b4-831edc03823d'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Martinez
    -- ID: b9206869-22b5-40d6-b31f-6e13aceef7cd
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'b9206869-22b5-40d6-b31f-6e13aceef7cd'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Andrew Garcia
    -- ID: b995d038-3edd-4d56-b22c-55eaf28785a2
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'b995d038-3edd-4d56-b22c-55eaf28785a2'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Chen
    -- ID: b9ba3d0a-d64a-4b9d-8336-f1b2821bb487
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'b9ba3d0a-d64a-4b9d-8336-f1b2821bb487'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lauren Hall
    -- ID: b9f3a215-2f66-4e6a-a547-14e4c69ddb6e
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'b9f3a215-2f66-4e6a-a547-14e4c69ddb6e'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rebecca Brown
    -- ID: ba0640ff-82b0-4491-bfc1-faa28f58e531
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'ba0640ff-82b0-4491-bfc1-faa28f58e531'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Regulatory Affairs Manager
    -- ID: bab034aa-6341-4a58-9d3a-9a16c571df0b
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'bab034aa-6341-4a58-9d3a-9a16c571df0b'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Morrison
    -- ID: bae42c4a-1554-4c0a-a563-a49b29edf462
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'bae42c4a-1554-4c0a-a563-a49b29edf462'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Victoria Chen
    -- ID: bb08152c-8185-48bc-a6aa-6299ebeecba3
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'bb08152c-8185-48bc-a6aa-6299ebeecba3'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Gonzalez
    -- ID: bb24d8fd-5106-4b97-ae3c-cf86599e5980
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'bb24d8fd-5106-4b97-ae3c-cf86599e5980'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Brown
    -- ID: bbb56114-fd04-4dd4-8fa9-b55fb2a662a3
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'bbb56114-fd04-4dd4-8fa9-b55fb2a662a3'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Martinez
    -- ID: bbe874b7-b9a1-4eca-9fa8-a9096ea49fe9
    UPDATE public.personas
    SET
        role_id = '7ac3598c-e21d-4aca-9db7-f152f6d99faf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'bbe874b7-b9a1-4eca-9fa8-a9096ea49fe9'::uuid
      AND (role_id IS DISTINCT FROM '7ac3598c-e21d-4aca-9db7-f152f6d99faf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Garcia
    -- ID: bc259cf0-8b77-420e-af93-c881a3f8bdd1
    UPDATE public.personas
    SET
        role_id = '59f6174c-cd72-462b-830c-235bb20099ac'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid,
        updated_at = NOW()
    WHERE id = 'bc259cf0-8b77-420e-af93-c881a3f8bdd1'::uuid
      AND (role_id IS DISTINCT FROM '59f6174c-cd72-462b-830c-235bb20099ac'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Wright
    -- ID: bc4a7e8c-2f38-4fc6-ab32-cb5ccf843829
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'bc4a7e8c-2f38-4fc6-ab32-cb5ccf843829'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia White
    -- ID: bc4dcda1-8966-4510-8e29-c53de7e945be
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'bc4dcda1-8966-4510-8e29-c53de7e945be'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Lopez
    -- ID: bcfb9152-522d-40cb-af72-b58b7a1c3a90
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'bcfb9152-522d-40cb-af72-b58b7a1c3a90'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Anthony Rossi
    -- ID: bd07b481-a0c7-42c0-b72f-28370fda22f6
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'bd07b481-a0c7-42c0-b72f-28370fda22f6'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Martinez
    -- ID: bd0b0a0d-f02c-4467-9af1-b62e369ca670
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'bd0b0a0d-f02c-4467-9af1-b62e369ca670'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rachel Brown
    -- ID: bdad3ebc-73ef-43cc-ab3c-7e7dfdfd8f67
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'bdad3ebc-73ef-43cc-ab3c-7e7dfdfd8f67'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lisa Chang
    -- ID: bdc91e15-f00b-43ff-a323-5f32a7de29db
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'bdc91e15-f00b-43ff-a323-5f32a7de29db'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lawrence Garcia
    -- ID: be2723aa-8873-42b7-a186-37fc1a219789
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'be2723aa-8873-42b7-a186-37fc1a219789'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Robinson
    -- ID: be6daa9f-2ac2-4986-bc8d-7a00bf238f26
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'be6daa9f-2ac2-4986-bc8d-7a00bf238f26'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Wilson
    -- ID: beb2a29d-245d-4f6a-b118-6552ac515823
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'beb2a29d-245d-4f6a-b118-6552ac515823'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Moore
    -- ID: beb436c5-2029-42e8-b077-30e0470db8d0
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'beb436c5-2029-42e8-b077-30e0470db8d0'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lawrence Garcia
    -- ID: bebd47eb-9133-4a26-ac55-df0b7c78debe
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'bebd47eb-9133-4a26-ac55-df0b7c78debe'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Brown
    -- ID: bedde15b-88a8-40b9-875b-0d25b5b62a92
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'bedde15b-88a8-40b9-875b-0d25b5b62a92'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Martinez
    -- ID: bf60074c-55d0-4844-8f64-7fca3ec473ed
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'bf60074c-55d0-4844-8f64-7fca3ec473ed'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Davis
    -- ID: bf612f5e-4d3d-4248-9ec6-948f750799ae
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'bf612f5e-4d3d-4248-9ec6-948f750799ae'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Rebecca Sullivan
    -- ID: bfb1bad8-df27-43e5-8ec3-5ef7cc0f2e56
    UPDATE public.personas
    SET
        role_id = '59f6174c-cd72-462b-830c-235bb20099ac'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid,
        updated_at = NOW()
    WHERE id = 'bfb1bad8-df27-43e5-8ec3-5ef7cc0f2e56'::uuid
      AND (role_id IS DISTINCT FROM '59f6174c-cd72-462b-830c-235bb20099ac'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Rebecca Sullivan
    -- ID: c115284b-f824-4d2f-b7be-e7d6ea9b47b8
    UPDATE public.personas
    SET
        role_id = '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid,
        updated_at = NOW()
    WHERE id = 'c115284b-f824-4d2f-b7be-e7d6ea9b47b8'::uuid
      AND (role_id IS DISTINCT FROM '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Thompson
    -- ID: c1ec0617-89f4-4f97-8daf-2361de53bb38
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'c1ec0617-89f4-4f97-8daf-2361de53bb38'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Martinez
    -- ID: c2036672-c3a2-4083-a7f7-bcbabb6f5e14
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = 'c2036672-c3a2-4083-a7f7-bcbabb6f5e14'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Hill
    -- ID: c24d397e-7360-4182-90d9-e5a28729cb9b
    UPDATE public.personas
    SET
        role_id = '240e8b25-3ba8-47ad-bdc6-1a7344d2dae7'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'c24d397e-7360-4182-90d9-e5a28729cb9b'::uuid
      AND (role_id IS DISTINCT FROM '240e8b25-3ba8-47ad-bdc6-1a7344d2dae7'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Johnson
    -- ID: c27125c4-1bc6-42fd-9b0f-4fe1f5e7370d
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'c27125c4-1bc6-42fd-9b0f-4fe1f5e7370d'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Martinez
    -- ID: c31be100-b4b5-44d9-a1ac-8ea101b4478f
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'c31be100-b4b5-44d9-a1ac-8ea101b4478f'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Wilson
    -- ID: c37fee15-cd5b-44e8-ba19-4f997508fc50
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'c37fee15-cd5b-44e8-ba19-4f997508fc50'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Lee
    -- ID: c38c11a4-5fb6-4417-b957-35eceef85586
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'c38c11a4-5fb6-4417-b957-35eceef85586'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Clinical Data Manager
    -- ID: c3dc76d2-7140-4350-8aa5-91226b56962e
    UPDATE public.personas
    SET
        role_id = '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid,
        updated_at = NOW()
    WHERE id = 'c3dc76d2-7140-4350-8aa5-91226b56962e'::uuid
      AND (role_id IS DISTINCT FROM '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Robert Taylor
    -- ID: c427474a-6f57-4bf2-bed0-c57bade200d1
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'c427474a-6f57-4bf2-bed0-c57bade200d1'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jessica Allen
    -- ID: c47779b2-7833-4c09-a65f-56283ac271a6
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'c47779b2-7833-4c09-a65f-56283ac271a6'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Kim
    -- ID: c53ead16-50ae-4ab4-a0fc-1b7ffc114bc9
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = 'c53ead16-50ae-4ab4-a0fc-1b7ffc114bc9'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Maria Rodriguez
    -- ID: c55fdf37-6af0-4d1c-8a3e-731c79f051fb
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'c55fdf37-6af0-4d1c-8a3e-731c79f051fb'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Thompson
    -- ID: c5b92ef1-5e2b-478f-b077-4c9089bc3ab5
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'c5b92ef1-5e2b-478f-b077-4c9089bc3ab5'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Wilson
    -- ID: c6405982-f6ef-45e5-8560-0e2048f95e92
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'c6405982-f6ef-45e5-8560-0e2048f95e92'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew Hall
    -- ID: c6d5e334-b6b6-4ff5-8cdd-2303419ae8ce
    UPDATE public.personas
    SET
        role_id = '1f1fd08d-2f4e-4121-b480-a3e74a174fca'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = 'c6d5e334-b6b6-4ff5-8cdd-2303419ae8ce'::uuid
      AND (role_id IS DISTINCT FROM '1f1fd08d-2f4e-4121-b480-a3e74a174fca'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Taylor
    -- ID: c714c32a-ef5f-4b43-be73-fe86dd326106
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'c714c32a-ef5f-4b43-be73-fe86dd326106'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Davis
    -- ID: c7310060-23de-4bae-a54c-d5b5e1610d05
    UPDATE public.personas
    SET
        role_id = '16ad9006-7b35-4b08-8386-d14ea7cf61fc'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid,
        updated_at = NOW()
    WHERE id = 'c7310060-23de-4bae-a54c-d5b5e1610d05'::uuid
      AND (role_id IS DISTINCT FROM '16ad9006-7b35-4b08-8386-d14ea7cf61fc'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Johnson
    -- ID: c7879c16-c368-49b4-b74a-91d8a017f3e2
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'c7879c16-c368-49b4-b74a-91d8a017f3e2'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Biostatistician
    -- ID: c850d626-d855-42aa-8654-8ab49dfa4132
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'c850d626-d855-42aa-8654-8ab49dfa4132'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Andrew Thompson
    -- ID: c8aca4b1-fe38-465d-8f89-28990ba7c4e6
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'c8aca4b1-fe38-465d-8f89-28990ba7c4e6'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Garcia
    -- ID: c8d4c67d-3073-4fbf-b43a-0e27403ba521
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'c8d4c67d-3073-4fbf-b43a-0e27403ba521'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Williams
    -- ID: ca2550d9-a29e-4629-bc62-12615c9b18ff
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'ca2550d9-a29e-4629-bc62-12615c9b18ff'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Ryan O''Connor
    -- ID: ca7cb840-6a2c-4d7a-98a2-9701fff0cb87
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'ca7cb840-6a2c-4d7a-98a2-9701fff0cb87'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Kevin Murphy
    -- ID: cb5e2ca3-18c8-49ec-93dc-0d4f9268c2d4
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'cb5e2ca3-18c8-49ec-93dc-0d4f9268c2d4'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michel Dubois
    -- ID: cba31c5f-588a-421b-928b-29d5b6397b36
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'cba31c5f-588a-421b-928b-29d5b6397b36'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lauren Young
    -- ID: cc0878ac-b7d4-42f4-b988-cee1ef115bd3
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'cc0878ac-b7d4-42f4-b988-cee1ef115bd3'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Victoria Thompson
    -- ID: cc896f15-4103-492e-b445-8c8ed9d20892
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'cc896f15-4103-492e-b445-8c8ed9d20892'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Catherine Lee
    -- ID: cd3683be-5545-4b64-a247-bb7521aea4ad
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'cd3683be-5545-4b64-a247-bb7521aea4ad'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Johnson
    -- ID: ce2861c9-a152-47d7-aeef-b522c7828eb5
    UPDATE public.personas
    SET
        role_id = '6b96b2e8-3e09-4785-861f-95878eb47e7e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid,
        updated_at = NOW()
    WHERE id = 'ce2861c9-a152-47d7-aeef-b522c7828eb5'::uuid
      AND (role_id IS DISTINCT FROM '6b96b2e8-3e09-4785-861f-95878eb47e7e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Anderson
    -- ID: ce3fc4a0-65b5-4569-8237-d8a6ea71cbd6
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'ce3fc4a0-65b5-4569-8237-d8a6ea71cbd6'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Johnson
    -- ID: cf032529-2fcc-4864-9ddf-1ecca60924c0
    UPDATE public.personas
    SET
        role_id = '59f6174c-cd72-462b-830c-235bb20099ac'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid,
        updated_at = NOW()
    WHERE id = 'cf032529-2fcc-4864-9ddf-1ecca60924c0'::uuid
      AND (role_id IS DISTINCT FROM '59f6174c-cd72-462b-830c-235bb20099ac'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '4ae18330-1257-4a0c-8b9e-ce85d8aea581'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Chen
    -- ID: cfde7354-d895-4fa3-8b8a-73caea19f49e
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'cfde7354-d895-4fa3-8b8a-73caea19f49e'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian Young
    -- ID: d06f6fb3-2029-4657-a48e-6cb9b95b0f40
    UPDATE public.personas
    SET
        role_id = '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = 'd06f6fb3-2029-4657-a48e-6cb9b95b0f40'::uuid
      AND (role_id IS DISTINCT FROM '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Lee
    -- ID: d14ad724-2862-4cd7-b186-ca02cb58c7bc
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'd14ad724-2862-4cd7-b186-ca02cb58c7bc'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Garcia
    -- ID: d1c84b66-db00-4b4b-b70c-63057941c48f
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'd1c84b66-db00-4b4b-b70c-63057941c48f'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Wright
    -- ID: d1e3cd09-1f6d-4577-b957-85812056242e
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = 'd1e3cd09-1f6d-4577-b957-85812056242e'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Thompson
    -- ID: d2203bbd-2953-4529-954a-be8be0694f37
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'd2203bbd-2953-4529-954a-be8be0694f37'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Melissa Anderson
    -- ID: d2ef6ac9-b2ef-4f92-870a-a0c2f732717e
    UPDATE public.personas
    SET
        role_id = '7ac3598c-e21d-4aca-9db7-f152f6d99faf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'd2ef6ac9-b2ef-4f92-870a-a0c2f732717e'::uuid
      AND (role_id IS DISTINCT FROM '7ac3598c-e21d-4aca-9db7-f152f6d99faf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Martin
    -- ID: d30dc3b6-088e-41d3-b689-62bb57c570cd
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'd30dc3b6-088e-41d3-b689-62bb57c570cd'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Martinez
    -- ID: d3373be2-4f2a-42d6-986c-5ebc7ee70b58
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'd3373be2-4f2a-42d6-986c-5ebc7ee70b58'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Rodriguez
    -- ID: d3cd6f8d-e5d0-4153-bb37-6087967a409b
    UPDATE public.personas
    SET
        role_id = '8f06ad67-dd82-4b91-b614-05fb513a966d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid,
        updated_at = NOW()
    WHERE id = 'd3cd6f8d-e5d0-4153-bb37-6087967a409b'::uuid
      AND (role_id IS DISTINCT FROM '8f06ad67-dd82-4b91-b614-05fb513a966d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Matthew Clark
    -- ID: d4b668e4-e5a8-4b8f-bd90-a930a48f32fc
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'd4b668e4-e5a8-4b8f-bd90-a930a48f32fc'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Martinez
    -- ID: d5b40048-c22a-4097-9f3c-3bb9ce70723d
    UPDATE public.personas
    SET
        role_id = '240e8b25-3ba8-47ad-bdc6-1a7344d2dae7'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'd5b40048-c22a-4097-9f3c-3bb9ce70723d'::uuid
      AND (role_id IS DISTINCT FROM '240e8b25-3ba8-47ad-bdc6-1a7344d2dae7'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda Wilson
    -- ID: d5f829fc-4cfe-46a9-ba78-5adb2a70920e
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = 'd5f829fc-4cfe-46a9-ba78-5adb2a70920e'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Stephanie Jones
    -- ID: d66ee217-d987-43f4-829f-aa5f16d1df71
    UPDATE public.personas
    SET
        role_id = '8f06ad67-dd82-4b91-b614-05fb513a966d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid,
        updated_at = NOW()
    WHERE id = 'd66ee217-d987-43f4-829f-aa5f16d1df71'::uuid
      AND (role_id IS DISTINCT FROM '8f06ad67-dd82-4b91-b614-05fb513a966d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '58ff5b07-f5e8-45dd-80f4-f37cea90a1cd'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Rodriguez
    -- ID: d6a89b96-981c-46a7-b532-a424ab0489cf
    UPDATE public.personas
    SET
        role_id = '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = 'd6a89b96-981c-46a7-b532-a424ab0489cf'::uuid
      AND (role_id IS DISTINCT FROM '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Walker
    -- ID: d6ac0ac4-9eef-41ed-a4e6-974b45572b35
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'd6ac0ac4-9eef-41ed-a4e6-974b45572b35'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Johnson
    -- ID: d6de0ccc-2e36-48fe-b3be-8003545e2799
    UPDATE public.personas
    SET
        role_id = '8d6ca186-f70a-4a13-a7b3-e32abb59f80b'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'd6de0ccc-2e36-48fe-b3be-8003545e2799'::uuid
      AND (role_id IS DISTINCT FROM '8d6ca186-f70a-4a13-a7b3-e32abb59f80b'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Lee
    -- ID: d74fcd62-c528-49ab-8cfb-0ed9a5a57649
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'd74fcd62-c528-49ab-8cfb-0ed9a5a57649'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda Foster
    -- ID: d7a78dca-98dd-4348-899a-7ffc9ee12710
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'd7a78dca-98dd-4348-899a-7ffc9ee12710'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Wilson
    -- ID: d8111752-7126-4499-a5c9-0243e0a723e5
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'd8111752-7126-4499-a5c9-0243e0a723e5'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Martinez
    -- ID: d81a68cf-1210-4d27-abca-cff013342820
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'd81a68cf-1210-4d27-abca-cff013342820'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Brown
    -- ID: d836f56c-5318-4459-86f1-886cceca0e50
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'd836f56c-5318-4459-86f1-886cceca0e50'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Chen
    -- ID: d848ecad-cb47-4890-9ced-c0e43c6e2a0d
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'd848ecad-cb47-4890-9ced-c0e43c6e2a0d'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rachel Lewis
    -- ID: d8561c2d-d85b-4f43-9c8b-46084cc1f00d
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'd8561c2d-d85b-4f43-9c8b-46084cc1f00d'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Anthony Rossi
    -- ID: d87e5890-8b8d-45d9-9de9-b4b2545a9a76
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'd87e5890-8b8d-45d9-9de9-b4b2545a9a76'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Chen
    -- ID: d91c7a14-4430-494e-9aee-ba9d5c755fc0
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'd91c7a14-4430-494e-9aee-ba9d5c755fc0'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Nina Patel
    -- ID: d96f9117-c5dd-4a62-b3b8-ff881886a8ad
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'd96f9117-c5dd-4a62-b3b8-ff881886a8ad'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Chen
    -- ID: da054c65-e306-4c96-99de-e54a146baeef
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'da054c65-e306-4c96-99de-e54a146baeef'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lauren Allen
    -- ID: da1c0c4b-3c3d-436a-87ab-5f3402c89a86
    UPDATE public.personas
    SET
        role_id = '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid,
        updated_at = NOW()
    WHERE id = 'da1c0c4b-3c3d-436a-87ab-5f3402c89a86'::uuid
      AND (role_id IS DISTINCT FROM '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda Garcia
    -- ID: da2b8829-8b27-40ad-bab2-7a0240ee82e6
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'da2b8829-8b27-40ad-bab2-7a0240ee82e6'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Thompson
    -- ID: da792ee8-d139-46d1-bb12-df229a8ee2d0
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'da792ee8-d139-46d1-bb12-df229a8ee2d0'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda White
    -- ID: da854c4c-8728-4a4b-8c65-51e921188890
    UPDATE public.personas
    SET
        role_id = '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = 'da854c4c-8728-4a4b-8c65-51e921188890'::uuid
      AND (role_id IS DISTINCT FROM '382ddb9c-172f-46bc-afa6-6a1e054a4f3f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Natalia Volkov
    -- ID: dadbafa7-b3cc-45f2-9d27-6cb3f607dcab
    UPDATE public.personas
    SET
        role_id = '16ad9006-7b35-4b08-8386-d14ea7cf61fc'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid,
        updated_at = NOW()
    WHERE id = 'dadbafa7-b3cc-45f2-9d27-6cb3f607dcab'::uuid
      AND (role_id IS DISTINCT FROM '16ad9006-7b35-4b08-8386-d14ea7cf61fc'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '778130cf-bd43-49bd-b027-4874ff5c82f5'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Ryan O''Connor
    -- ID: daf8e46a-87d8-4aee-99d6-8e9be32de71a
    UPDATE public.personas
    SET
        role_id = 'df1a13c8-dfe3-4ace-bf78-0f9a9ac63462'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid,
        updated_at = NOW()
    WHERE id = 'daf8e46a-87d8-4aee-99d6-8e9be32de71a'::uuid
      AND (role_id IS DISTINCT FROM 'df1a13c8-dfe3-4ace-bf78-0f9a9ac63462'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Chen
    -- ID: daff6d34-4971-49e4-95b3-bbdc96bf677b
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'daff6d34-4971-49e4-95b3-bbdc96bf677b'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lauren Clark
    -- ID: db870b25-439c-4b20-a844-8342d19bfe8b
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'db870b25-439c-4b20-a844-8342d19bfe8b'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Thompson
    -- ID: dc13692f-0d44-4b54-a9ad-e2b486e284c5
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'dc13692f-0d44-4b54-a9ad-e2b486e284c5'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Kevin Martinez
    -- ID: dcd47ba8-e6d9-4477-8920-dd16c406e68d
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'dcd47ba8-e6d9-4477-8920-dd16c406e68d'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Young
    -- ID: dcdfdaf0-acc8-4880-bb1f-c47dc41a31bf
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'dcdfdaf0-acc8-4880-bb1f-c47dc41a31bf'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer King
    -- ID: dce9b36b-44e4-48aa-87de-b8701985af1a
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'dce9b36b-44e4-48aa-87de-b8701985af1a'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Maria Gonzalez
    -- ID: dd1edc3b-8bb4-43b8-b1bb-a96a616881e4
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'dd1edc3b-8bb4-43b8-b1bb-a96a616881e4'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elizabeth Kim
    -- ID: ddce6600-4f3b-4d4f-9a62-38e0124048e1
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = 'ddce6600-4f3b-4d4f-9a62-38e0124048e1'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sophia Andersen
    -- ID: ddcf81da-f0f7-4ca7-a5e3-9376657d87a7
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'ddcf81da-f0f7-4ca7-a5e3-9376657d87a7'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Rachel Robinson
    -- ID: ddfa93bb-0c5c-45d4-afae-c27ae9925f2f
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'ddfa93bb-0c5c-45d4-afae-c27ae9925f2f'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Peterson
    -- ID: ddfb9ef9-3a33-4324-89fa-0d14d8b5f590
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'ddfb9ef9-3a33-4324-89fa-0d14d8b5f590'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Wu
    -- ID: de1300ad-4a6d-4f76-ab17-0f2dff795737
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'de1300ad-4a6d-4f76-ab17-0f2dff795737'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elena Kovalenko
    -- ID: dfc1f41f-681d-45ad-916b-299f59f92a60
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'dfc1f41f-681d-45ad-916b-299f59f92a60'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Wilson
    -- ID: e0ab4551-e3c7-48f2-8de2-adb167725e21
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'e0ab4551-e3c7-48f2-8de2-adb167725e21'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Melissa Brown
    -- ID: e0c6d814-a0a6-4904-990d-f344f70c8389
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'e0c6d814-a0a6-4904-990d-f344f70c8389'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael King
    -- ID: e12404bf-135c-4163-bf6c-6a93e6a1f264
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'e12404bf-135c-4163-bf6c-6a93e6a1f264'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Daniel Rodriguez
    -- ID: e16dc08d-7425-44f8-8fd5-7a6e49f1688b
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'e16dc08d-7425-44f8-8fd5-7a6e49f1688b'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Andrew Wilson
    -- ID: e1b81426-7d57-4ecc-bd5e-48bf30af78ce
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'e1b81426-7d57-4ecc-bd5e-48bf30af78ce'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Lee
    -- ID: e24279b5-48f2-4947-9e2e-f19708eb41d3
    UPDATE public.personas
    SET
        role_id = '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = 'e24279b5-48f2-4947-9e2e-f19708eb41d3'::uuid
      AND (role_id IS DISTINCT FROM '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Lewis
    -- ID: e27ffaef-6d55-44d3-9899-0ad1e837bd68
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = 'e27ffaef-6d55-44d3-9899-0ad1e837bd68'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Rodriguez
    -- ID: e2ee40da-e615-438b-a66c-0806deda3241
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'e2ee40da-e615-438b-a66c-0806deda3241'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Daniel Chen
    -- ID: e3548bee-db1e-4e00-8127-ef13a3075099
    UPDATE public.personas
    SET
        role_id = '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'e3548bee-db1e-4e00-8127-ef13a3075099'::uuid
      AND (role_id IS DISTINCT FROM '9c0acda0-e886-4a19-ab1a-94b4289535ed'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Clark
    -- ID: e3c95ec8-c8f9-40bd-98ad-5c1f30f7ad38
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'e3c95ec8-c8f9-40bd-98ad-5c1f30f7ad38'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. James Lee
    -- ID: e48c6134-900f-42b9-b68f-c91536838b9b
    UPDATE public.personas
    SET
        role_id = '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid,
        updated_at = NOW()
    WHERE id = 'e48c6134-900f-42b9-b68f-c91536838b9b'::uuid
      AND (role_id IS DISTINCT FROM '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elizabeth Davis
    -- ID: e4a12ca6-7e06-4669-9f4e-b7a9b9bef389
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'e4a12ca6-7e06-4669-9f4e-b7a9b9bef389'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Wilson
    -- ID: e4fa1f80-ef9f-4c09-bc9f-e4c12eb7aaf3
    UPDATE public.personas
    SET
        role_id = 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'e4fa1f80-ef9f-4c09-bc9f-e4c12eb7aaf3'::uuid
      AND (role_id IS DISTINCT FROM 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Lee
    -- ID: e5a00758-4d53-4256-81e3-c038d77bee62
    UPDATE public.personas
    SET
        role_id = '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid,
        updated_at = NOW()
    WHERE id = 'e5a00758-4d53-4256-81e3-c038d77bee62'::uuid
      AND (role_id IS DISTINCT FROM '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Lee
    -- ID: e5b509c8-cdb9-49c7-90f3-227bbea1a4a6
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'e5b509c8-cdb9-49c7-90f3-227bbea1a4a6'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jennifer Martinez
    -- ID: e5e36bd7-bb50-4319-9180-a0ceea857b49
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'e5e36bd7-bb50-4319-9180-a0ceea857b49'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Martinez
    -- ID: e5edb21f-1717-497b-a5b8-27d0d0b5fc92
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'e5edb21f-1717-497b-a5b8-27d0d0b5fc92'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Garcia
    -- ID: e61c9aca-1f60-4df9-bb4c-8cae3f1ff95d
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'e61c9aca-1f60-4df9-bb4c-8cae3f1ff95d'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Andrew Wilson
    -- ID: e62801fc-0bc5-4449-87d0-df55e9b51e2c
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'e62801fc-0bc5-4449-87d0-df55e9b51e2c'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Brown
    -- ID: e685d314-65be-4bb0-9220-869ad3a382a0
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'e685d314-65be-4bb0-9220-869ad3a382a0'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Martinez
    -- ID: e7918264-883c-4af6-a56f-a8bfd8432cc2
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'e7918264-883c-4af6-a56f-a8bfd8432cc2'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Ryan Martinez
    -- ID: e808576b-d792-4fe0-9e85-38a0f03cb71d
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'e808576b-d792-4fe0-9e85-38a0f03cb71d'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Thompson
    -- ID: e8201d1a-1bb8-4515-8899-634f985c1fd0
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'e8201d1a-1bb8-4515-8899-634f985c1fd0'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Akiko Tanaka
    -- ID: e8aa3804-1771-4c8e-a926-08b55e38929d
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'e8aa3804-1771-4c8e-a926-08b55e38929d'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Yuki Sakura
    -- ID: e8d14fec-8357-4cf1-95f9-69331c4742ac
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'e8d14fec-8357-4cf1-95f9-69331c4742ac'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elena Kovalenko
    -- ID: e934d2ef-8b3b-4f09-b51b-33fb0ed2492f
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'e934d2ef-8b3b-4f09-b51b-33fb0ed2492f'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Lawrence Garcia
    -- ID: e954965b-1936-4e7e-9efd-638ded0743c7
    UPDATE public.personas
    SET
        role_id = '92417d4c-59ed-4800-bebe-d0149d18bf05'::uuid,
        function_id = '1ff28cf9-17b8-451b-89b1-999048b6542d'::uuid,
        department_id = '0052e6e5-d15c-415c-91fe-6dc6a373a37b'::uuid,
        updated_at = NOW()
    WHERE id = 'e954965b-1936-4e7e-9efd-638ded0743c7'::uuid
      AND (role_id IS DISTINCT FROM '92417d4c-59ed-4800-bebe-d0149d18bf05'::uuid
           OR function_id IS DISTINCT FROM '1ff28cf9-17b8-451b-89b1-999048b6542d'::uuid
           OR department_id IS DISTINCT FROM '0052e6e5-d15c-415c-91fe-6dc6a373a37b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Richard Chen
    -- ID: e9bf3b5d-515a-43c6-b5e8-64edd1d66b9b
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'e9bf3b5d-515a-43c6-b5e8-64edd1d66b9b'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Elizabeth Rodriguez
    -- ID: e9d6fe2e-b98b-406b-9c61-28c7e39c881b
    UPDATE public.personas
    SET
        role_id = '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid,
        updated_at = NOW()
    WHERE id = 'e9d6fe2e-b98b-406b-9c61-28c7e39c881b'::uuid
      AND (role_id IS DISTINCT FROM '74e2692a-4e00-4d1a-a970-4bc3fa8cb943'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '2192fe3e-ec53-4492-a4f6-d96c692ec8aa'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Garcia
    -- ID: ea7bc08a-1500-457c-9407-504a0372373e
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'ea7bc08a-1500-457c-9407-504a0372373e'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Clark
    -- ID: ead8ccee-58b3-410a-9827-cf879ca9a5b1
    UPDATE public.personas
    SET
        role_id = '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'ead8ccee-58b3-410a-9827-cf879ca9a5b1'::uuid
      AND (role_id IS DISTINCT FROM '3003984a-ae1f-4bd8-b111-ad7bff3c726b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Wilson
    -- ID: eaf0202f-447d-4622-ab6a-d806c67d341e
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'eaf0202f-447d-4622-ab6a-d806c67d341e'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Margaret O''Connor
    -- ID: eb2f514b-6877-4522-a939-e2aabda83b82
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'eb2f514b-6877-4522-a939-e2aabda83b82'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Andrew Johnson
    -- ID: eb53e11b-c23b-44eb-a19d-575c4c5a740a
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'eb53e11b-c23b-44eb-a19d-575c4c5a740a'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Susan Lee
    -- ID: eb8ee8ef-973a-411f-85a5-dff9656a4d89
    UPDATE public.personas
    SET
        role_id = 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'eb8ee8ef-973a-411f-85a5-dff9656a4d89'::uuid
      AND (role_id IS DISTINCT FROM 'f8669c3a-0648-4799-aed0-818cdc415373'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lisa Clark
    -- ID: ebdad7b8-0bb1-425c-a811-e8050bbcc8fa
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = 'ebdad7b8-0bb1-425c-a811-e8050bbcc8fa'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Brown
    -- ID: ec467577-488d-492c-be8d-43e2cd878103
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'ec467577-488d-492c-be8d-43e2cd878103'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Torres
    -- ID: ec7d00b8-8704-47a9-9e89-c0393e757428
    UPDATE public.personas
    SET
        role_id = '7977ab44-be4d-418c-8e6d-fcf92f6d98b1'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'ec7d00b8-8704-47a9-9e89-c0393e757428'::uuid
      AND (role_id IS DISTINCT FROM '7977ab44-be4d-418c-8e6d-fcf92f6d98b1'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Marcus Johnson
    -- ID: ecda480b-5124-4fa4-b70a-505e33415b02
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'ecda480b-5124-4fa4-b70a-505e33415b02'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Rodriguez
    -- ID: ecffbc9f-f667-4307-8972-e2d92b20dd3b
    UPDATE public.personas
    SET
        role_id = '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid,
        updated_at = NOW()
    WHERE id = 'ecffbc9f-f667-4307-8972-e2d92b20dd3b'::uuid
      AND (role_id IS DISTINCT FROM '3d4e6860-08f4-4e1c-aa99-8c15e73b86c2'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '1500b9ff-4475-4820-a782-4ce2bfc66187'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Richard Wilson
    -- ID: ed0567b6-dbb2-4464-b0fe-38c78ff45c0e
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'ed0567b6-dbb2-4464-b0fe-38c78ff45c0e'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Monica Flores
    -- ID: ed1f3533-6a48-4624-b324-ed13f2f80249
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'ed1f3533-6a48-4624-b324-ed13f2f80249'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Sarah Davis
    -- ID: ed8c0c99-e405-4559-945a-fe38679c4b44
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'ed8c0c99-e405-4559-945a-fe38679c4b44'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Young
    -- ID: ed92e269-82e8-42b8-833e-cc69ccbb0674
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = 'ed92e269-82e8-42b8-833e-cc69ccbb0674'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jessica Wright
    -- ID: eeed6f53-f633-42b9-8cc7-d0f263ecdab3
    UPDATE public.personas
    SET
        role_id = '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid,
        updated_at = NOW()
    WHERE id = 'eeed6f53-f633-42b9-8cc7-d0f263ecdab3'::uuid
      AND (role_id IS DISTINCT FROM '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Rodriguez
    -- ID: ef06bbd7-5416-4638-a5ee-edef7e1126d8
    UPDATE public.personas
    SET
        role_id = 'c6f91d15-8a63-4140-928b-bd82b39dd33d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = 'ef06bbd7-5416-4638-a5ee-edef7e1126d8'::uuid
      AND (role_id IS DISTINCT FROM 'c6f91d15-8a63-4140-928b-bd82b39dd33d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Ahmed Hassan
    -- ID: efb7938f-93a6-455a-9a93-f0ddb16e2e0b
    UPDATE public.personas
    SET
        role_id = '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'efb7938f-93a6-455a-9a93-f0ddb16e2e0b'::uuid
      AND (role_id IS DISTINCT FROM '02820aaa-ad3d-4d8b-aa4e-6c3e1233eefa'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Garcia
    -- ID: efb916f8-3851-4b37-8cd0-bb024318f4b3
    UPDATE public.personas
    SET
        role_id = '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = 'efb916f8-3851-4b37-8cd0-bb024318f4b3'::uuid
      AND (role_id IS DISTINCT FROM '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Natalia Volkov
    -- ID: f00ee4d8-87c4-4674-ab39-6b443ba7b3aa
    UPDATE public.personas
    SET
        role_id = '1cd1953d-301e-4ad7-995c-6137fa319ada'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid,
        updated_at = NOW()
    WHERE id = 'f00ee4d8-87c4-4674-ab39-6b443ba7b3aa'::uuid
      AND (role_id IS DISTINCT FROM '1cd1953d-301e-4ad7-995c-6137fa319ada'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Patricia Brown
    -- ID: f0268766-9af0-402b-ac1c-f719a8417534
    UPDATE public.personas
    SET
        role_id = '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid,
        updated_at = NOW()
    WHERE id = 'f0268766-9af0-402b-ac1c-f719a8417534'::uuid
      AND (role_id IS DISTINCT FROM '89b27806-8b0f-4bc9-aaab-da7cfb69c95e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM '71205b0c-c37b-4445-9a46-f2ab3349538c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Hall
    -- ID: f112f881-4844-414e-9642-a1d53cb53053
    UPDATE public.personas
    SET
        role_id = 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid,
        updated_at = NOW()
    WHERE id = 'f112f881-4844-414e-9642-a1d53cb53053'::uuid
      AND (role_id IS DISTINCT FROM 'e7f6ad84-6c0a-4c4f-8d53-589ac08daf0f'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'f2ccc63e-051e-4046-a6a3-fc3a9fd2a9fb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Wilson
    -- ID: f1a74a76-02f6-4bed-83b0-2b44442bdf40
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'f1a74a76-02f6-4bed-83b0-2b44442bdf40'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Amanda Chen
    -- ID: f1d9134d-d652-4ada-8758-1d1054655f58
    UPDATE public.personas
    SET
        role_id = '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid,
        updated_at = NOW()
    WHERE id = 'f1d9134d-d652-4ada-8758-1d1054655f58'::uuid
      AND (role_id IS DISTINCT FROM '0e6ff76f-2f96-4e20-a9e5-c38cf30e0c81'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'bbead9a4-332b-4324-b67b-9eac9c9b9b2a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sarah Garcia
    -- ID: f31f376f-72c2-459f-b507-138bab0f0a25
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'f31f376f-72c2-459f-b507-138bab0f0a25'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Anthony Rossi
    -- ID: f34b323f-ae4a-4e29-8188-9d6e2de7fa1c
    UPDATE public.personas
    SET
        role_id = 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid,
        updated_at = NOW()
    WHERE id = 'f34b323f-ae4a-4e29-8188-9d6e2de7fa1c'::uuid
      AND (role_id IS DISTINCT FROM 'b5899878-ad58-4dd5-a465-341fd83326ba'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'a379e214-72e1-4975-aaea-7be76fbc4291'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Rodriguez
    -- ID: f42c8678-f573-4c65-8032-fc96e332c76d
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'f42c8678-f573-4c65-8032-fc96e332c76d'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. David Garcia
    -- ID: f5621189-b865-4c95-ad2f-9ee9228d6982
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'f5621189-b865-4c95-ad2f-9ee9228d6982'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Rodriguez
    -- ID: f58d0710-5c72-4937-ba7a-a7faa2bef701
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'f58d0710-5c72-4937-ba7a-a7faa2bef701'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Emily Davis
    -- ID: f63db25d-f90d-47d8-a4ee-100061025d59
    UPDATE public.personas
    SET
        role_id = '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'f63db25d-f90d-47d8-a4ee-100061025d59'::uuid
      AND (role_id IS DISTINCT FROM '61bf4c51-9b5c-42e1-93ca-3a2c318d5473'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Thompson
    -- ID: f6527c90-8c3e-48a1-ad80-0d69f45d0207
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'f6527c90-8c3e-48a1-ad80-0d69f45d0207'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sophie Moreau
    -- ID: f67ab6f7-a1d2-4b49-aaa0-04f3fbe599f8
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'f67ab6f7-a1d2-4b49-aaa0-04f3fbe599f8'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Jessica Clark
    -- ID: f6e473c1-e021-417a-93da-0e01d2f67d7a
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'f6e473c1-e021-417a-93da-0e01d2f67d7a'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Emily Clark
    -- ID: f8cb5889-e58d-4d2f-aa1b-51c59528482c
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = 'f8cb5889-e58d-4d2f-aa1b-51c59528482c'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Chen
    -- ID: f8ece7d6-47dd-4f7b-aa55-9f9b1aa65976
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'f8ece7d6-47dd-4f7b-aa55-9f9b1aa65976'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michael Martinez
    -- ID: f91f9f94-a263-49e2-9ac0-21acf3615110
    UPDATE public.personas
    SET
        role_id = '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid,
        updated_at = NOW()
    WHERE id = 'f91f9f94-a263-49e2-9ac0-21acf3615110'::uuid
      AND (role_id IS DISTINCT FROM '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: James Thompson
    -- ID: f95744fe-5570-4a5b-9e12-7d187a9c85fc
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = 'f95744fe-5570-4a5b-9e12-7d187a9c85fc'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Thompson
    -- ID: f9884552-6a95-4998-bb5d-9954893fc80c
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'f9884552-6a95-4998-bb5d-9954893fc80c'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Brian Davis
    -- ID: f9d263e4-ebce-466f-a703-367d151463d3
    UPDATE public.personas
    SET
        role_id = 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid,
        updated_at = NOW()
    WHERE id = 'f9d263e4-ebce-466f-a703-367d151463d3'::uuid
      AND (role_id IS DISTINCT FROM 'd8bcd034-3577-44e5-8930-235c8298a913'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fe06fda5-b32e-43cc-b9ce-58880c2c686b'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Rodriguez
    -- ID: f9ff8998-f597-48d9-bbec-b2efe09f3cf7
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'f9ff8998-f597-48d9-bbec-b2efe09f3cf7'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Taylor
    -- ID: fa05a2a5-86be-40d7-a45e-c2cfa4aff4ac
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'fa05a2a5-86be-40d7-a45e-c2cfa4aff4ac'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Matthew Chen
    -- ID: fa544d48-dca1-402a-8b4b-942b3c72032d
    UPDATE public.personas
    SET
        role_id = '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'fa544d48-dca1-402a-8b4b-942b3c72032d'::uuid
      AND (role_id IS DISTINCT FROM '63dc8a50-0a26-44d1-a5d2-e924a880c8bf'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Timothy Brown
    -- ID: fabe4e3f-d1ee-44fd-99fd-b5fcbefd0b13
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = 'fabe4e3f-d1ee-44fd-99fd-b5fcbefd0b13'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Richard Thompson
    -- ID: fadc7fbd-ae17-4470-a628-380e04efc1ef
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'fadc7fbd-ae17-4470-a628-380e04efc1ef'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Rajesh Kumar
    -- ID: faed099c-76ac-4a3f-8440-ca7ce63e9157
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'faed099c-76ac-4a3f-8440-ca7ce63e9157'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Robert Williams
    -- ID: faf9b713-d044-4ceb-b091-5aff44f5a301
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'faf9b713-d044-4ceb-b091-5aff44f5a301'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Thompson
    -- ID: fb31988c-18a0-4323-8c52-e6dca26deddc
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'fb31988c-18a0-4323-8c52-e6dca26deddc'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Laura Garcia
    -- ID: fb996eef-4d73-4695-b9f5-c06214f815af
    UPDATE public.personas
    SET
        role_id = '19a36941-0698-452c-a007-0649fec8516e'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'fb996eef-4d73-4695-b9f5-c06214f815af'::uuid
      AND (role_id IS DISTINCT FROM '19a36941-0698-452c-a007-0649fec8516e'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Harris
    -- ID: fbcae921-b76f-48f7-acde-3c9694d7b3c5
    UPDATE public.personas
    SET
        role_id = '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid,
        updated_at = NOW()
    WHERE id = 'fbcae921-b76f-48f7-acde-3c9694d7b3c5'::uuid
      AND (role_id IS DISTINCT FROM '75e9374c-98f0-4920-a966-a0e3c76b1f4b'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'd6f5df01-4093-4123-8462-0a9c7a639358'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Lisa Clark
    -- ID: fc2adc5c-c8d0-40a2-869a-22921e87f366
    UPDATE public.personas
    SET
        role_id = '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid,
        updated_at = NOW()
    WHERE id = 'fc2adc5c-c8d0-40a2-869a-22921e87f366'::uuid
      AND (role_id IS DISTINCT FROM '3ab9bfd0-038e-40c6-879b-b7c1b58fd93e'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e4af2d21-74ac-4a36-87c3-88741c357d9a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Christopher Smith
    -- ID: fc4fddcb-275a-4134-9444-d19381fa7b8d
    UPDATE public.personas
    SET
        role_id = 'c7f0c3ae-7ac4-4f97-aacf-9c5896e32dd6'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'fc4fddcb-275a-4134-9444-d19381fa7b8d'::uuid
      AND (role_id IS DISTINCT FROM 'c7f0c3ae-7ac4-4f97-aacf-9c5896e32dd6'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Hill
    -- ID: fc59b2ef-62b6-4d2e-a95b-c77b934fbcc2
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'fc59b2ef-62b6-4d2e-a95b-c77b934fbcc2'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: David Williams
    -- ID: fc90f681-ca1a-4d02-b7b5-a985e309a772
    UPDATE public.personas
    SET
        role_id = 'bbbbd1ec-666d-4710-9049-a3669109464d'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'b02f8883-25b4-4582-8c95-ccc46aa1bd7a'::uuid,
        updated_at = NOW()
    WHERE id = 'fc90f681-ca1a-4d02-b7b5-a985e309a772'::uuid
      AND (role_id IS DISTINCT FROM 'bbbbd1ec-666d-4710-9049-a3669109464d'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'b02f8883-25b4-4582-8c95-ccc46aa1bd7a'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Andrew Miller
    -- ID: fcc70101-5b8e-4cc5-8503-2d428f3abc80
    UPDATE public.personas
    SET
        role_id = 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'fcc70101-5b8e-4cc5-8503-2d428f3abc80'::uuid
      AND (role_id IS DISTINCT FROM 'b2cb85ff-23ff-4d9e-9818-43a14b9d9e5f'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Brian White
    -- ID: fd18f936-93b7-4182-942a-79f0729c75f7
    UPDATE public.personas
    SET
        role_id = '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid,
        updated_at = NOW()
    WHERE id = 'fd18f936-93b7-4182-942a-79f0729c75f7'::uuid
      AND (role_id IS DISTINCT FROM '7629a173-967d-4812-8eaa-1fb3a96107d2'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '31ea2b26-d768-4999-a70b-cb82d6ca4df6'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Kevin Thompson
    -- ID: fd7d43f6-e912-404f-97ea-32a493d48db5
    UPDATE public.personas
    SET
        role_id = '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid,
        updated_at = NOW()
    WHERE id = 'fd7d43f6-e912-404f-97ea-32a493d48db5'::uuid
      AND (role_id IS DISTINCT FROM '73b81764-2bbd-4ffb-aadf-5e6010033098'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'fda0bc3c-89fb-4fab-af9d-7bf6ec494990'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Sophia Andersen
    -- ID: fda00025-b6ef-400e-9d20-4a8441117cca
    UPDATE public.personas
    SET
        role_id = 'df1a13c8-dfe3-4ace-bf78-0f9a9ac63462'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid,
        updated_at = NOW()
    WHERE id = 'fda00025-b6ef-400e-9d20-4a8441117cca'::uuid
      AND (role_id IS DISTINCT FROM 'df1a13c8-dfe3-4ace-bf78-0f9a9ac63462'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM 'fa4db96c-a5b0-43a9-a730-254d11b0d8bb'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Nicole Martin
    -- ID: fe2e170d-7541-453a-8f66-def322d182b8
    UPDATE public.personas
    SET
        role_id = '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid,
        updated_at = NOW()
    WHERE id = 'fe2e170d-7541-453a-8f66-def322d182b8'::uuid
      AND (role_id IS DISTINCT FROM '67c495b7-66b5-4fa4-8ea9-80ebcd9c358c'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'aff6c1f3-f07e-40c7-9ab8-72058fb0404e'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Laura Martinez
    -- ID: fea52860-7ec0-4e29-b8af-4ffcadcbd230
    UPDATE public.personas
    SET
        role_id = '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = '393c01d6-7569-4b07-a989-e68726b191e0'::uuid,
        updated_at = NOW()
    WHERE id = 'fea52860-7ec0-4e29-b8af-4ffcadcbd230'::uuid
      AND (role_id IS DISTINCT FROM '50cfcf16-000d-49d0-8c9a-8296062f3106'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM '393c01d6-7569-4b07-a989-e68726b191e0'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Christopher Anderson
    -- ID: feae893a-666d-4e01-b670-a9e14ca4a875
    UPDATE public.personas
    SET
        role_id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid,
        function_id = 'ae0283a2-222f-4703-a17d-06129789a156'::uuid,
        department_id = '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid,
        updated_at = NOW()
    WHERE id = 'feae893a-666d-4e01-b670-a9e14ca4a875'::uuid
      AND (role_id IS DISTINCT FROM 'bb7ca388-4417-47af-856d-8ca6baa57c71'::uuid
           OR function_id IS DISTINCT FROM 'ae0283a2-222f-4703-a17d-06129789a156'::uuid
           OR department_id IS DISTINCT FROM '9f2d5932-b700-4992-b15a-2d7a519ab442'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Amanda Rodriguez
    -- ID: fec637ae-8451-4e0e-8b7b-6bf3ef46b677
    UPDATE public.personas
    SET
        role_id = 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid,
        function_id = '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid,
        department_id = 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid,
        updated_at = NOW()
    WHERE id = 'fec637ae-8451-4e0e-8b7b-6bf3ef46b677'::uuid
      AND (role_id IS DISTINCT FROM 'e9ff10f9-09bb-4288-b458-a3a015ec3537'::uuid
           OR function_id IS DISTINCT FROM '00cc66af-499b-4165-b4ed-4fbd1405a24f'::uuid
           OR department_id IS DISTINCT FROM 'ae0f6def-ae41-4854-86c0-f590697f757c'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: John Anderson
    -- ID: fedc76d8-1ae3-4a38-ba88-2947bc5ecfe3
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'fedc76d8-1ae3-4a38-ba88-2947bc5ecfe3'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Michael Zhang
    -- ID: ff200570-9e26-4765-83fa-60da9822e7ba
    UPDATE public.personas
    SET
        role_id = '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid,
        function_id = '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid,
        department_id = '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid,
        updated_at = NOW()
    WHERE id = 'ff200570-9e26-4765-83fa-60da9822e7ba'::uuid
      AND (role_id IS DISTINCT FROM '9a12cbdf-713c-4071-b6bd-c92e5724e533'::uuid
           OR function_id IS DISTINCT FROM '2b8abe28-e9cf-4f4d-9d1b-dab9e4470393'::uuid
           OR department_id IS DISTINCT FROM '5a358b3f-8585-4c46-8c35-11673aa3c9bf'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Dr. Jennifer Brown
    -- ID: ff294b0c-d667-4f21-b3c4-4041ca1a9d64
    UPDATE public.personas
    SET
        role_id = '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid,
        function_id = '0139ffd3-a956-4909-844b-af4639cb7015'::uuid,
        department_id = 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid,
        updated_at = NOW()
    WHERE id = 'ff294b0c-d667-4f21-b3c4-4041ca1a9d64'::uuid
      AND (role_id IS DISTINCT FROM '36055133-1863-4f9b-9c2f-0a1ac5dcdb38'::uuid
           OR function_id IS DISTINCT FROM '0139ffd3-a956-4909-844b-af4639cb7015'::uuid
           OR department_id IS DISTINCT FROM 'e11e90fb-0fac-4596-99d9-6290c5bcd3e1'::uuid);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        IF '{role_id}'::uuid IS NOT NULL THEN personas_with_role := personas_with_role + 1; END IF;
        IF '{function_id}'::uuid IS NOT NULL THEN personas_with_function := personas_with_function + 1; END IF;
        IF '{department_id}'::uuid IS NOT NULL THEN personas_with_department := personas_with_department + 1; END IF;
        IF '{role_id}'::uuid IS NOT NULL AND '{function_id}'::uuid IS NOT NULL AND '{department_id}'::uuid IS NOT NULL THEN
            personas_fully_mapped := personas_fully_mapped + 1;
        END IF;
    END IF;

    -- Persona: Michelle Davis
    -- ID: 0323987a-0686-4cd1-854b-5b0fc59d03af
    UPDATE public.personas
    SET
        role_id = 'e7793227-cc0c-4deb-bd8b-15badf5c2eae'::uuid,
        updated_at = NOW()
    WHERE id = '0323987a-0686-4cd1-854b-5b0fc59d03af'::uuid;

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
    END IF;

    -- Persona: Dr. James Patterson
    -- ID: 0edf8c12-d5ae-47d7-a26e-1491c1ef19f7
    UPDATE public.personas
    SET
        role_id = '9607e231-208f-444e-9a57-7db450db3701'::uuid,
        updated_at = NOW()
    WHERE id = '0edf8c12-d5ae-47d7-a26e-1491c1ef19f7'::uuid;

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
    END IF;

    -- Persona: Medical Information Manager
    -- ID: 1aee832b-1e1c-4252-a7ff-5835f1959bbd
    UPDATE public.personas
    SET
        role_id = 'c3407b04-427e-442e-bc63-79fb2be83046'::uuid,
        updated_at = NOW()
    WHERE id = '1aee832b-1e1c-4252-a7ff-5835f1959bbd'::uuid;

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
    END IF;

    -- Persona: Medical Affairs Director
    -- ID: 22e2cfa4-3cf7-4377-a735-7262b3913934
    UPDATE public.personas
    SET
        role_id = '4ef0cfd3-d0b0-498d-b441-828b90cd010d'::uuid,
        updated_at = NOW()
    WHERE id = '22e2cfa4-3cf7-4377-a735-7262b3913934'::uuid;

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
    END IF;

    -- Persona: Dr. Kevin Brown
    -- ID: 4b9dd77d-0af3-4699-b82a-f6ea5628a6e8
    UPDATE public.personas
    SET
        role_id = 'e7793227-cc0c-4deb-bd8b-15badf5c2eae'::uuid,
        updated_at = NOW()
    WHERE id = '4b9dd77d-0af3-4699-b82a-f6ea5628a6e8'::uuid;

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
    END IF;

    -- Persona: Medical Science Liaison
    -- ID: fcf8e0eb-6437-42b9-a16e-1fc22f9a175e
    UPDATE public.personas
    SET
        role_id = '2015f823-3718-470c-ad01-4262c272ccc8'::uuid,
        updated_at = NOW()
    WHERE id = 'fcf8e0eb-6437-42b9-a16e-1fc22f9a175e'::uuid;

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ MAPPING COMPLETE';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total personas updated: %', personas_updated;
    RAISE NOTICE 'Personas with role_id: %', personas_with_role;
    RAISE NOTICE 'Personas with function_id: %', personas_with_function;
    RAISE NOTICE 'Personas with department_id: %', personas_with_department;
    RAISE NOTICE 'Fully mapped personas (all three): %', personas_fully_mapped;

END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Summary statistics
SELECT 
    '=== MAPPING SUMMARY ===' as section;

SELECT 
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped
FROM public.personas
WHERE deleted_at IS NULL;
