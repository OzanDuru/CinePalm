import React from "react";
import ScreenContainer from "../components/ScreenContainer";
import EmptyState from "../components/EmptyState";

export default function FavoritesScreen() {
  const isEmpty = true; // demo boş senaryo

  return (
    <ScreenContainer>
      {isEmpty ? (
        <EmptyState
          title="No items yet"
          subtitle="Favori veya watchlist'e eklediğin içerikler burada gözükecek."
        />
      ) : (
        null
      )}
    </ScreenContainer>
  );
}
