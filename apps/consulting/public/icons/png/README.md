# PNG Icons Directory

This directory contains PNG versions of icons for the VITAL Path platform.

## Directory Structure

```
public/icons/png/
├── avatars/          # Avatar icons for agents
├── medical/          # Medical-related icons
├── regulatory/       # Regulatory and compliance icons
├── process/          # Process and workflow icons
└── general/          # General purpose icons
```

## File Naming Convention

Use the same naming convention as the database:
- `01arab_male_people_beard_islam_avatar_man.png`
- `02boy_people_avatar_man_male_freckles_ginger.png`
- etc.

## Recommended Specifications

- **Format**: PNG with transparency
- **Size**: 64x64 pixels (or higher for retina displays)
- **Naming**: Match the existing database entries exactly (just change .svg to .png)

## Usage

Once PNG files are placed here, the system will automatically:
1. Detect PNG files exist
2. Use local PNG files instead of Supabase SVG files
3. Work seamlessly with Next.js Image optimization

## To Add Icons

1. Place PNG files in the appropriate category folder
2. Use the exact same filename as in the database (replace .svg with .png)
3. The system will automatically prefer these local PNG files