export default function NotebookLoading() {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<h2 className="text-2xl font-semibold mb-2">
					Loading Notebook
				</h2>
				<p className="text-muted-foreground">
					Please wait while we load your notebook...
				</p>
			</div>
		</div>
	);
}
