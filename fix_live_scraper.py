#!/usr/bin/env python3
"""
Script to fix the live_scraper.py file by adding the simple contact detection methods
"""

def main():
    # Read the main file
    with open('trevnoctilla-backend/services/live_scraper.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Read the simple methods
    with open('trevnoctilla-backend/services/temp_methods.py', 'r', encoding='utf-8') as f:
        simple_methods = f.read()

    # Replace the complex find_contact_page method with a simple one
    old_method_start = '''    async def find_contact_page(self):
        """
        Find contact page URL with EXTENSIVE pattern matching
        Uses 10,000+ patterns across 50+ languages
        """'''

    new_method = '''    async def find_contact_page(self):
        """
        Simple contact detection based on successful patterns from logs
        """
        return await self.find_contact_method_simple()'''

    # Find the old method and replace it
    if old_method_start in content:
        # Find the end of the old method (before scan_homepage_for_contact_info)
        method_end_marker = '\n    async def scan_homepage_for_contact_info(self):'
        start_idx = content.find(old_method_start)
        end_idx = content.find(method_end_marker, start_idx)

        if end_idx != -1:
            # Replace the old method with the new simple one
            old_method_content = content[start_idx:end_idx]
            content = content.replace(old_method_content, new_method)

            # Add the simple methods before scan_homepage_for_contact_info
            insert_point = content.find('\n    async def scan_homepage_for_contact_info(self):')
            if insert_point != -1:
                # Add the simple methods
                content = content[:insert_point] + '\n' + simple_methods + '\n' + content[insert_point:]

                # Write back to file
                with open('trevnoctilla-backend/services/live_scraper.py', 'w', encoding='utf-8') as f:
                    f.write(content)

                print("Successfully updated live_scraper.py")
                return

    print("Failed to find the method to replace")

if __name__ == '__main__':
    main()