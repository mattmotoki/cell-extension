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

// Using Tamagui theme tokens for dropdown styling 
// instead of hardcoded values for better theme support
const StyledContent = styled(Select.Content, {
  backgroundColor: '$gray3',
  borderColor: '$gray6',
  borderWidth: 1,
  borderRadius: '$2',
  overflow: 'hidden',
});

// Styled component for dropdown items using theme tokens
const StyledItem = styled(Select.Item, {
  backgroundColor: 'transparent',
  hoverStyle: { backgroundColor: '$blue3' },
  focusStyle: { backgroundColor: '$blue4' },
  pressStyle: { backgroundColor: '$blue5' },
});

// Styled component for dropdown item text using theme tokens
const StyledItemText = styled(Select.ItemText, {
  color: '$color',
  fontSize: '$4',
  fontWeight: '500',
  padding: '$1',
});

// Define the Picker Item component to match the RN Picker API
const Item: React.FC<ItemProps> = ({ label, value, color }) => {
  return (
    <StyledItem index={0} value={value}>
      <StyledItemText color={color}>{label}</StyledItemText>
    </StyledItem>
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
          <Select.Value 
            placeholder={selectedLabel} 
            color={theme.color}
            fontSize={16}
            fontWeight="500"
          />
          <Select.Icon>
            <ChevronDown color={dropdownIconColor || theme.color?.toString()} />
          </Select.Icon>
        </StyledTrigger>
        
        {Platform.OS === 'web' ? (
          // Native select dropdown for web
          <StyledContent>
            <Select.ScrollUpButton />
            <Select.Viewport>
              <Select.Group>
                {items.map((item, index) => (
                  <StyledItem key={index} index={index} value={item.value}>
                    <StyledItemText
                      style={itemStyle}
                    >
                      {item.label}
                    </StyledItemText>
                  </StyledItem>
                ))}
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </StyledContent>
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

            <StyledContent>
              <Select.ScrollUpButton />
              <Select.Viewport>
                <Select.Group>
                  <YStack gap="$2">
                    {items.map((item, index) => (
                      <StyledItem key={index} index={index} value={item.value}>
                        <StyledItemText
                          style={itemStyle}
                        >
                          {item.label}
                        </StyledItemText>
                      </StyledItem>
                    ))}
                  </YStack>
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton />
            </StyledContent>
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