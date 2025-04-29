/**
 * src/shared/components/Picker.tsx - Cross-Platform Picker Component
 * 
 * This component provides a unified select dropdown interface across platforms
 * using Tamagui's Select component. It maintains the React Native Picker API
 * for backward compatibility while offering modern styling and animations.
 */

import React from 'react';
import { 
  Select, 
  Adapt, 
  Sheet, 
  YStack, 
  useTheme, 
  styled,
  XStack,
  Text,
  View
} from 'tamagui';
import { ChevronDown } from '@tamagui/lucide-icons';
import { Platform } from 'react-native';

// Define props for the Item component
interface ItemProps {
  label: string;
  value: any;
  color?: string;
}

// Define the main Picker component with similar API to RN Picker
interface PickerProps {
  selectedValue: any;
  onValueChange: (value: any, index: number) => void;
  style?: any;
  enabled?: boolean;
  dropdownIconColor?: string;
  itemStyle?: any;
  children: React.ReactNode;
}

// Styled components for Picker
const StyledSelect = styled(Select, {
  width: '100%',
  backgroundColor: 'transparent',
  variants: {
    disabled: {
      true: {
        opacity: 0.5,
      }
    }
  } as const
});

const StyledTrigger = styled(Select.Trigger, {
  height: 50,
  borderWidth: 0,
  borderRadius: '$2',
  backgroundColor: 'transparent',
});

// Define the Picker Item component to match the RN Picker API
const Item: React.FC<ItemProps> = ({ label, value, color }) => {
  return (
    <Select.Item index={0} value={value}>
      <Select.ItemText color={color}>{label}</Select.ItemText>
    </Select.Item>
  );
};

const Picker: React.FC<PickerProps> & { Item: React.FC<ItemProps> } = ({ 
  selectedValue, 
  onValueChange, 
  style, 
  enabled = true, 
  children,
  dropdownIconColor,
  itemStyle,
  ...rest 
}) => {
  const theme = useTheme();
  
  // Extract item props from children with proper typing
  const items = React.Children.map(children, (child) => {
    if (React.isValidElement<ItemProps>(child) && child.type === Item) {
      const { label, value } = child.props;
      return { label, value };
    }
    return null;
  })?.filter(Boolean) || [];
  
  // Find the label for the currently selected value
  const selectedLabel = items.find(item => item.value === selectedValue)?.label || '';

  // Convert the style prop to match Tamagui
  const containerStyle = {
    width: style?.width || '100%',
    height: style?.height || 50,
    ...((typeof style === 'object') ? style : {})
  };

  return (
    <View style={containerStyle}>
      <StyledSelect
        value={selectedValue}
        onValueChange={(value) => {
          const index = items.findIndex(item => item.value === value);
          onValueChange(value, index >= 0 ? index : 0);
        }}
        disabled={!enabled}
        {...rest}
      >
        <StyledTrigger>
          <Select.Value placeholder={selectedLabel} color={theme.color} />
          <Select.Icon>
            <ChevronDown color={dropdownIconColor || theme.color?.toString()} />
          </Select.Icon>
        </StyledTrigger>
        
        {Platform.OS === 'web' ? (
          // Native select dropdown for web
          <Select.Content>
            <Select.ScrollUpButton />
            <Select.Viewport>
              <Select.Group>
                {items.map((item, index) => (
                  <Select.Item key={index} index={index} value={item.value}>
                    <Select.ItemText
                      style={itemStyle}
                      color={itemStyle?.color || theme.color}
                    >
                      {item.label}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        ) : (
          // Sheet-based select for mobile
          <>
            <Adapt when="sm" platform="touch">
              <Sheet modal dismissOnSnapToBottom>
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay />
              </Sheet>
            </Adapt>

            <Select.Content>
              <Select.ScrollUpButton />
              <Select.Viewport>
                <Select.Group>
                  <YStack gap="$2">
                    {items.map((item, index) => (
                      <Select.Item key={index} index={index} value={item.value}>
                        <Select.ItemText
                          style={itemStyle}
                          color={itemStyle?.color || theme.color}
                        >
                          {item.label}
                        </Select.ItemText>
                      </Select.Item>
                    ))}
                  </YStack>
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton />
            </Select.Content>
          </>
        )}
      </StyledSelect>
    </View>
  );
};

// Assign Item as a static property of Picker
Picker.Item = Item;

// Export both as named and default export for flexibility
export { Picker };
export default Picker; 