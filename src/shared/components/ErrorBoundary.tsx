import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { Text, View } from 'react-native';

import { AppButton } from '@/shared/components/AppButton';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ScreenContainer scroll={false}>
          <View className="gap-4 py-8">
            <Text className="text-2xl font-bold text-ink">Something went wrong</Text>
            <Text className="text-base leading-6 text-muted">
              {this.state.error.message || 'An unexpected error occurred.'}
            </Text>
            <AppButton onPress={this.handleRetry}>Try again</AppButton>
          </View>
        </ScreenContainer>
      );
    }

    return this.props.children;
  }
}
